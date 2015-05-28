/**
 * Created by XaeroDegreaz on 05/02/2015.
 */
(function () {
    app.service('TvApiService', [
        'SettingsService', '$timeout',
        function (SettingsService, $timeout) {
            var requestCount = 0;
            var requestLimit = 40;
            var timePeriod = 10000;
            var tvApiCache = {
                shows: [],
                seasons: []
            };
            var errorMessage = 'Unavailable.';

            function sync() {
                chrome.storage.local.set({'tvApiCache': tvApiCache}, function () {
                    console.log(chrome.runtime.lastError);
                });
            }

            function findShowByName(showName, callback) {
                var query = Enumerable.from(tvApiCache.shows);
                var showResult = query.where('$.name == "' + showName + '"').firstOrDefault();
                if (showResult) {
                    callback(showResult.id);
                } else {
                    theMovieDb.search.getTv({query: showName}, function (data) {
                        var searchResponse = JSON.parse(data);
                        var results = searchResponse.results;
                        //console.log(searchResponse);
                        if (results.length === 0) {
                            callback(errorMessage);
                            return;
                        }
                        var showResult = results[0];
                        tvApiCache.shows.push({name: showName, id: showResult.id});
                        sync();
                        callback(showResult.id);
                    }, function (data) {
                        console.error(data);
                        $timeout(function () {
                            findShowByName(showName, callback);
                        }, 10000);
                    });
                }
            }

            function findLatestEpisodeByShowIdAndSeasonNumber(showId, seasonNumber, callback) {
                var query = Enumerable.from(tvApiCache.seasons);
                var seasonResult = query.where('$.showId == ' + showId + ' && $.seasonNumber == ' + seasonNumber).firstOrDefault();
                if (seasonResult) {
                    getLatest(seasonResult.obj, callback);
                } else {
                    theMovieDb.tvSeasons.getById({
                            id: showId,
                            season_number: seasonNumber
                        },
                        function (data) {
                            var seasonResult = JSON.parse(data);
                            var query = Enumerable.from(seasonResult.episodes);
                            var airDates = query.select('$.air_date').distinct().toArray();
                            tvApiCache.seasons.push({showId: showId, seasonNumber: seasonNumber, obj: airDates});
                            sync();
                            getLatest(airDates, callback);
                        },
                        function (data) {
                            console.error(data);
                            tryGetData(showId, callback);
                            $timeout(function () {
                                findLatestEpisodeByShowIdAndSeasonNumber(showId, seasonNumber, callback);
                            }, 10000);
                        })
                }

            }

            function getLatest(airDates, callback) {
                //console.log(searchResponse, show, latestSeasonResult, season);
                var query = Enumerable.from(airDates);
                var today = moment().startOf('day');
                var latestEpisodeDate = query.firstOrDefault(function (d) {
                    if (d != null) {
                        var airDate = moment(d).startOf('day');
                        return airDate >= today;
                    } else {
                        return false;
                    }
                });
                if (latestEpisodeDate === null) {
                    latestEpisodeDate = query.lastOrDefault(function (d) {
                        return d != null;
                    });
                }
                if (latestEpisodeDate === null) {
                    callback(errorMessage);
                } else {
                    callback(latestEpisodeDate);
                }
            }

            function tryGetData(showId, callback) {
                if(showId === errorMessage){
                    callback(errorMessage);
                    return;
                }
                //# Preemtively display last known good data while this calls out to check for new information.
                //# Keeps 'Loading...' from displaying if we have at least SOME data.
                var query = Enumerable.from(tvApiCache.seasons);
                var seasons = query.where('$.showId == ' + showId).toArray();
                if (seasons.length > 0) {
                    query = Enumerable.from(seasons);
                    var seasonNumber = query.max('$.seasonNumber');
                    var seasonResult = query.where('$.showId == ' + showId + ' && $.seasonNumber == ' + seasonNumber).firstOrDefault();
                    if (seasonResult) {
                        getLatest(seasonResult.obj, callback);
                    }
                }
            }

            var serviceObject = {
                isEnabled: function () {
                    return SettingsService.settings.useTvApi && SettingsService.settings.tvApiKey != null;
                },
                initialize: function () {
                    theMovieDb.common.api_key = SettingsService.settings.tvApiKey;
                    chrome.storage.local.get('tvApiCache', function (data) {
                        tvApiCache = (!data.tvApiCache) ? tvApiCache : data.tvApiCache;
                    });
                },
                findNextEpisodeDate: function (showName, callback) {
                    if (!this.isEnabled()) {
                        return;
                    }
                    findShowByName(showName, function (showResultId) {
                        if(showResultId === errorMessage){
                            callback(errorMessage);
                            return;
                        }
                        function findTvShowById(showId, callback) {
                            theMovieDb.tv.getById({id: showResultId},
                                function (data) {
                                    var show = JSON.parse(data);
                                    //console.log(show);
                                    var query = Enumerable.from(show.seasons);
                                    var eligibleSeasons = query.where('$.air_date != null').toArray();
                                    if (eligibleSeasons.length === 0) {
                                        callback(errorMessage);
                                        return;
                                    }
                                    var latestSeasonResult = eligibleSeasons[eligibleSeasons.length - 1];
                                    findLatestEpisodeByShowIdAndSeasonNumber(show.id, latestSeasonResult.season_number, callback);
                                }, function (data) {
                                    console.error(data);
                                    tryGetData(showId, callback);
                                    $timeout(function () {
                                        findTvShowById(showId, callback);
                                    }, 10000);
                                })
                        }

                        findTvShowById(showResultId, callback);
                    });
                }
            };
            return serviceObject;
        }
    ]);
})();