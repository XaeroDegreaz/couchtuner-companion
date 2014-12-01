(function () {
    app.service('SyncService', function () {
        var data = {
            bookmarks: [],
            history: [],
            settings: {
                bookmarkSync: false,
                historySync: false
            }
        };

        function sync(key, callback) {
            var payload = {};
            payload[key] = data[key];

            if (!payload[key]) {
                payload[key] = [];
            }

            var saveFunction = getSaveFunction(key);

            saveFunction.set(payload, function () {
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
        function getSaveFunction(key) {
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

        return {
            initialize: function (callback) {
                console.log("Initializing sync service...");
                //# Settings first
                getSaveFunction('settings').get('settings', function (storedData) {
                    if (storedData['settings']) {
                        data['settings'] = storedData['settings'];
                    }

                    //# Bookmarks
                    getSaveFunction('bookmarks').get('bookmarks', function (storedData) {
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
                    getSaveFunction('history').get('history', function (storedData) {
                        if (storedData['history']) {
                            data['history'] = storedData['history'];
                        }
                    });
                });
            },

            getDataObject: function () {
                return data;
            },

            removeBookmark: function (bookmarkIndex) {
                //# We null here instead of splice so that bookmark buttons will not colide
                //# due to the potential of assigning a duplicate bookmarkIndex on the click event.
                //# We instead null, and the ids will be steadily incremented. When the extension
                //# is loaded on the next page load, we will cull the null keys at that time
                //# since we don't need any multiple-page-load-persistent keys.
                data['bookmarks'][bookmarkIndex] = null;
                sync('bookmarks');
                return data['bookmarks'];
            },

            addBookmark: function (bookmarkObject) {
                data['bookmarks'].push(bookmarkObject);
                sync('bookmarks');
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
                if(!data['settings'].historySync) {
                    return;
                }
                this.getHistory().push(historyItemObject);
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