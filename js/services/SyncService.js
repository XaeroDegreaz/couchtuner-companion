(function () {
    app.service('SyncService', function () {
        var data = {};

        return {
            initialize: function (callback) {
                console.log("Initializing sync service...");
                chrome.storage.sync.get(null, function (storedData) {
                    data = storedData;
                    callback();
                });
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
                var q = Enumerable.from(data["bookmarks"]);
                data["bookmarks"] = q.orderBy("$.name").toArray();
                return data["bookmarks"];
            },

            setBookmarks: function (bookmarks) {
                return data["bookmarks"] = bookmarks;
            },

            sync: function (key) {
                var payload = {};
                payload[key] = data[key];

                if (!payload[key]) {
                    payload[key] = [];
                }

                chrome.storage.sync.set(payload, function () {
                    //console.log("Sync: " + data[key]);
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