(function () {
    app.service('SyncService', function () {
        var data = {};

        return {
            initialize: function (callback) {
                console.log("Initializing sync service...");
                var sync = this.sync;
                chrome.storage.sync.get(null, function (storedData) {
                    data = storedData;
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
            },
            removeBookmark: function (bookmarkIndex) {
                //# We null here instead of splice so that bookmark buttons will not colide
                //# due to the potential of assigning a duplicate bookmarkIndex on the click event.
                //# We instead null, and the ids will be steadily incremented. When the extension
                //# is loaded on the next page load, we will cull the null keys at that time
                //# since we don't need any multiple-page-load-persistent keys.
                data['bookmarks'][bookmarkIndex] = null;
                this.sync('bookmarks');
                return data['bookmarks'];
            },
            addBookmark: function (bookmarkObject) {
                data['bookmarks'].push(bookmarkObject);
                this.sync('bookmarks');
                return data['bookmarks'];
            },
            getSettings: function () {
                if (!data["settings"]) {
                    return (data["settings"] = {
                        historyTracking: "Off",
                        bookmarkStorage: "Local"
                    });
                }
                return data["settings"];
            },
            setSetting: function (setting, value) {
                data["settings"][setting] = value;
                this.sync("settings");
            },
            getHistory: function () {
                if (!data["history"]) {
                    return (data["history"] = []);
                }
                var q = Enumerable.from(data["history"]);
                data["history"] = q.orderBy("$.time").reverse().toArray();
                return data["history"];
            },

            setHistory: function (history) {
                return data["history"] = history;
            },

            getBookmarks: function () {
                if (!data["bookmarks"]) {
                    return (data["bookmarks"] = []);
                }
                return data["bookmarks"];
            },

            setBookmarks: function (bookmarks) {
                return data["bookmarks"] = bookmarks;
            },

            sync: function (key, callback) {
                var payload = {};
                payload[key] = data[key];

                if (!payload[key]) {
                    payload[key] = [];
                }

                chrome.storage.sync.set(payload, function () {
                    if (callback) {
                        callback();
                    }
                });
            },

            retrieve: function (key, callback) {
                chrome.storage.sync.get(key, function (items) {
                    //console.log("Retrieve: " + items);
                    data[key] = items[key];
                    callback(items);
                });
            },

            clear: function () {
                chrome.storage.sync.clear();
            }
        }
    });
})();