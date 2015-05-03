/**
 * Created by XaeroDegreaz on 05/02/2015.
 */
(function () {
    app.service('TvApiService', [
        'SettingsService',
        function (SettingsService) {
            var errorMessage = 'Unavailable.';
            var serviceObject = {
                isEnabled: function () {
                    return SettingsService.settings.useTvApi && SettingsService.settings.tvApiKey != null;
                },
                initialize: function () {
                    theMovieDb.common.api_key = SettingsService.settings.tvApiKey;
                },
                findNextEpisodeDate: function (showName, callback) {
                    if (!this.isEnabled()) {
                        return;
                    }
                    theMovieDb.search.getTv({query: showName},
                        function (data) {
                            var searchResponse = JSON.parse(data);
                            //console.log(searchResponse);
                            if(searchResponse.results.length === 0){
                                callback(errorMessage);
                                return;
                            }
                            var showResult = searchResponse.results[0];
                            theMovieDb.tv.getById({id: showResult.id},
                                function (data) {
                                    var show = JSON.parse(data);
                                    //console.log(show);
                                    var query = Enumerable.from(show.seasons);
                                    var eligibleSeasons = query.where('$.air_date != null').toArray();
                                    if(eligibleSeasons.length === 0){
                                        callback(errorMessage);
                                        return;
                                    }
                                    var latestSeasonResult = eligibleSeasons[eligibleSeasons.length - 1];
                                    theMovieDb.tvSeasons.getById({
                                            id: show.id,
                                            season_number: latestSeasonResult.season_number
                                        },
                                        function (data) {
                                            var season = JSON.parse(data);
                                            //console.log(searchResponse, show, latestSeasonResult, season);
                                            var query = Enumerable.from(season.episodes);
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
                                            if(latestEpisode === null) {
                                                callback(errorMessage);
                                            }else {
                                                callback(latestEpisode.air_date);
                                            }
                                        },
                                        function (data) {
                                            console.log(data);
                                        })
                                }, function (data) {
                                    console.log(data);
                                })
                        }, function (data) {
                            console.log(data);
                        });
                }
            };
            return serviceObject;
        }
    ]);
})();