(function () {
    app.service('SyncService', function () {
        var data = {};

        return {
            links: [],
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
                var q = Enumerable.from(data["bookmarks"]);
                data["bookmarks"] = q.orderBy("$.name").toArray();
                return data["bookmarks"];
            },

            setBookmarks: function (bookmarks) {
                return data["bookmarks"] = bookmarks;
            },

            setHistory: function (history) {
                return data["history"] = history;
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