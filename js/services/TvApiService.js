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
                chrome.storage.local.set({'tvApiCache': tvApiCache});
            }

            function findShowByName(showName, callback) {
                var showResult = tvApiCache.shows[showName];
                if (showResult) {
                    callback(showResult);
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
                        tvApiCache.shows[showName] = showResult;
                        sync();
                        callback(showResult);
                    }, function (data) {
                        console.error(data);
                        $timeout(function () {
                            findShowByName(showName, callback);
                        }, 10000);
                    });
                }
            }

            function findLatestEpisodeByShowIdAndSeasonNumber(showId, seasonNumber, callback) {
                var showSeasons = tvApiCache.seasons[showId];
                if (showSeasons) {
                    var seasonResult = showSeasons[seasonNumber];
                    if (seasonResult) {
                        getLatest(seasonResult);
                    }
                } else {
                    theMovieDb.tvSeasons.getById({
                            id: showId,
                            season_number: seasonNumber
                        },
                        function (data) {
                            var seasonResult = JSON.parse(data);
                            tvApiCache.seasons[showId] = [];
                            tvApiCache.seasons[showId][seasonNumber] = seasonResult;
                            sync();
                            getLatest(seasonResult);
                        },
                        function (data) {
                            console.error(data);
                            $timeout(function () {
                                findLatestEpisodeByShowIdAndSeasonNumber(showId, seasonNumber, callback);
                            }, 10000);
                        })
                }

                function getLatest(seasonResult) {
                    //console.log(searchResponse, show, latestSeasonResult, season);
                    var query = Enumerable.from(seasonResult.episodes);
                    var today = moment().startOf('day');
                    var latestEpisode = query.firstOrDefault(function (e) {
                        if (e.air_date != null) {
                            var airDate = moment(e.air_date).startOf('day');
                            return airDate >= today;
                        } else {
                            return false;
                        }
                    });
                    if (latestEpisode === null) {
                        latestEpisode = query.lastOrDefault(function (e) {
                            return e.air_date != null;
                        });
                    }
                    if (latestEpisode === null) {
                        callback(errorMessage);
                    } else {
                        callback(latestEpisode.air_date);
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
                        tvApiCache = (!data.tvApiCache.shows) ? tvApiCache : data.tvApiCache;
                    });
                },
                findNextEpisodeDate: function (showName, callback) {
                    if (!this.isEnabled()) {
                        return;
                    }

                    findShowByName(showName, function (showResult) {
                        function findTvShowById(showId, callback) {
                            theMovieDb.tv.getById({id: showResult.id},
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
                                    $timeout(function () {
                                        findTvShowById(showId, callback);
                                    }, 10000);
                                })
                        }

                        findTvShowById(showResult.id, callback);
                    });
                }
            };
            return serviceObject;
        }
    ]);
})();