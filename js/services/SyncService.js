(function () {
    app.service('SyncService', function () {
        var data = {
            bookmarks: [],
            history: [],
            settings: {
                bookmarkSync: false,
                historySync: false,
                useTvApi: false,
                tvApiKey: null
            }
        };

        function sync(key, callback) {
            var storageMethod = getStorageMethod(key);

            storageMethod.get(key, function (retrieved) {
                if (key === "bookmarks") {
                    //# Merge local bookmarks and retrieved bookmarks
                    $.merge(data[key], retrieved);
                    var existingBookmarkNames = [];

                    //# We remove dupes, but we still want to keep null elements
                    //# so that we don't lose array indexes for this page load.
                    data[key] = $.grep(data[key], function (bookmark) {
                        if (bookmark && $.inArray(bookmark.name, existingBookmarkNames) !== -1) {
                            return false;
                        } else {
                            existingBookmarkNames.push(!bookmark ? null : bookmark.name);
                            return true;
                        }
                    });
                }
            });

            var payload = {};
            payload[key] = data[key];

            if (!payload[key]) {
                payload[key] = [];
            }

            storageMethod.set(payload, function () {
                if (callback) {
                    callback();
                }
            });
        }

        /**
         * Determine which storage method to use
         * @param key
         * @returns {*}
         */
        function getStorageMethod(key) {
            var storageSync = chrome.storage.sync;
            var storageLocal = chrome.storage.local;

            switch (key) {
                case 'bookmarks':
                    return (data['settings'].bookmarkSync) ? storageSync : storageLocal;
                case 'history':
                    return (data['settings'].historySync === 'Sync') ? storageSync : storageLocal;
                case 'settings':
                    return storageSync;
            }
            console.error("Could not determine save function to use.", key);
        }

        function clear() {
            chrome.storage.sync.clear();
        }

        //# TODO - Remove this duplicate code as it's already implemented in HistoryScan
        function getNiceNumber(number) {
            number = parseInt(number);
            var niceNumber = (number >= 0 && number < 10) ? "0" + number : number;
            return niceNumber;
        }

        //# TODO - Fix this hack
        function getNiceName(string) {
            try {
                var regex = /(http:\/\/)((.+)\/)+((.+)(s)(eason)?\-?(\d{1,2}))((.*)(e)(pisode)?\-?(\d{1,2}))/i;
                var groups = regex.exec(string);
                var showName = groups[5];
                var season = getNiceNumber(groups[8]);
                var episode = getNiceNumber(groups[13]);

                return showName + " - S" + season + "E" + episode;
            }catch(err){
                console.log(err);
            }
        }

        return {
            initialize: function (callback) {
                console.log("Initializing sync service...");
                //# Settings first
                getStorageMethod('settings').get('settings', function (storedData) {
                    if (storedData['settings']) {
                        data['settings'] = storedData['settings'];
                    }

                    //# Bookmarks
                    getStorageMethod('bookmarks').get('bookmarks', function (storedData) {
                        if (storedData['bookmarks']) {
                            data['bookmarks'] = storedData['bookmarks'];
                        }

                        var query = Enumerable.from(data['bookmarks']);
                        var bookmarks = query.where('$ !== null').toArray();
                        if (bookmarks.length != data['bookmarks'].length) {
                            console.log("Deleted null keys. Resyncing...");
                            data['bookmarks'] = bookmarks;
                            sync('bookmarks', function () {
                                callback();
                            });
                        } else {
                            data['bookmarks'] = bookmarks;
                            callback();
                        }
                    });

                    //# History
                    getStorageMethod('history').get('history', function (storedData) {
                        if (storedData['history']) {
                            data['history'] = storedData['history'];
                        }
                    });
                });
            },

            getDataObject: function () {
                return data;
            },

            bookmarkListener: function(){
                console.log('Not initialized.');
            },
            removeBookmark: function (bookmarkIndex) {
                //# We null here instead of splice so that bookmark buttons will not colide
                //# due to the potential of assigning a duplicate bookmarkIndex on the click event.
                //# We instead null, and the ids will be steadily incremented. When the extension
                //# is loaded on the next page load, we will cull the null keys at that time
                //# since we don't need any multiple-page-load-persistent keys.
                data['bookmarks'][bookmarkIndex] = null;
                sync('bookmarks');
                this.bookmarkListener();
                return data['bookmarks'];
            },

            addBookmark: function (bookmarkObject) {
                data['bookmarks'].push(bookmarkObject);
                sync('bookmarks');
                this.bookmarkListener();
                return data['bookmarks'];
            },

            saveSettings: function () {
                sync('settings');
            },

            removeHistoryItem: function (item) {
                var history = this.getHistory();
                var index = history.indexOf(item);
                history.splice(index, 1);
                sync("history");
            },

            addHistoryItem: function (historyItemObject) {
                if (!data['settings'].historySync) {
                    return;
                }
                if (data.history[0] && getNiceName(data.history[0].url) === getNiceName(historyItemObject.url)) {
                    data.history[0] = historyItemObject;
                } else {
                    this.getHistory().push(historyItemObject);
                }

                var q = Enumerable.from(data["history"]);
                data.history = q.orderBy("$.time").reverse().toArray();
                sync('history');
            },

            getSettings: function (defaultObject) {
                if (!data["settings"]) {
                    return (data["settings"] = defaultObject);
                }
                return data["settings"];
            },

            getHistory: function () {
                if (!data["history"]) {
                    return (data["history"] = []);
                }
                var q = Enumerable.from(data["history"]);
                data["history"] = q.orderBy("$.time").reverse().toArray();
                return data["history"];
            },

            getBookmarks: function () {
                if (!data["bookmarks"]) {
                    return (data["bookmarks"] = []);
                }
                return data["bookmarks"];
            }
        }
    });
})();