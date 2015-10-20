'use strict';

app.factory('SourceQueue', ['$location', '$rootScope', 'SockService', 'AUTH_EVENTS', 'SYNC_EVENTS',
    function ($location, $rootScope, SockService, AUTH_EVENTS, SYNC_EVENTS) {
        var last_error = "";
        var queues = [];

        function queue_event(msg) {
            if (msg['error'] == 0) {
                if(msg['query'] == 'fetchall') {
                    queues = msg['data'];
                    $rootScope.$broadcast(SYNC_EVENTS.queuesRefresh);
                }
                if(msg['query'] == 'add') {
                    $rootScope.$broadcast(SYNC_EVENTS.queueAddSuccess);
                }

            } else {
                last_error = msg['data']['message'];
                if(msg['query'] == 'add') {
                    $rootScope.$broadcast(SYNC_EVENTS.queueAddFailed);
                }
            }
        }

        function setup() {
            SockService.add_recv_handler('queue', queue_event);
            $rootScope.$on(AUTH_EVENTS.loginSuccess, function (event, args) {
                SockService.send({
                    'type': 'queue',
                    'message': {
                        'query': 'fetchall'
                    }
                });
            });
        }

        function get_queue_num(player_id) {
            for(var i = 0; i < queues.length; i++) {
                if(queues[i].target == player_id) {
                    return i;
                }
            }
            return -1;
        }

        function get_queue(queue_num) {
            return queues[queue_num];
        }

        function add(player_id, url) {
            SockService.send({
                'type': 'queue',
                'message': {
                    'query': 'add',
                    'player_id': player_id,
                    'url': url
                }
            });
        }

        function remove(queue_id, remove) {

        }

        function get_last_error() {
            return last_error;
        }

        return {
            queues: queues,
            setup: setup,
            add: add,
            remove: remove,
            get_queue_num: get_queue_num,
            get_queue: get_queue,
            get_last_error: get_last_error
        };
    }
]);