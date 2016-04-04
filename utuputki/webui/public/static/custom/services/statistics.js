'use strict';

app.factory('Statistics', ['$location', '$rootScope', 'SockService', 'AUTH_EVENTS', 'SYNC_EVENTS',
    function ($location, $rootScope, SockService, AUTH_EVENTS, SYNC_EVENTS) {
        var last_error = "";
        var user_ratings = [];

        function stats_event(msg, query) {
            if (msg['error'] == 1) {
                last_error = msg['data']['message'];
            } else {
                if(query == 'fetch_ratings') {
                    user_ratings = msg['data'];
                    $rootScope.$broadcast(SYNC_EVENTS.statsRefresh);
                    return;
                }
                console.error("Unknown incoming stats packet subtype!")
            }
        }

        function setup() {
            SockService.add_recv_handler('stats', stats_event);
            $rootScope.$on(AUTH_EVENTS.loginSuccess, function (event, args) {
                refresh();
            });
        }

        function get_ratings() {
            return user_ratings;
        }

        function get_last_error() {
            return last_error;
        }

        function refresh() {
            SockService.send_msg('stats', {}, 'fetch_ratings');
        }

        return {
            setup: setup,
            get_last_error: get_last_error,
            get_ratings: get_ratings,
            refresh: refresh
        };
    }
]);
