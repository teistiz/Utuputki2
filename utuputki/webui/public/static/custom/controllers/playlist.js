'use strict';

app.controller('PlaylistController', ['$scope', '$window', '$rootScope', '$location', 'Player', 'Event', 'Playlist', 'Session', 'SYNC_EVENTS', 'AUTH_EVENTS',
    function ($scope, $window, $rootScope, $location, Player, Event, Playlist, Session, SYNC_EVENTS, AUTH_EVENTS) {
        $scope.data = [];
        $scope.gridApi = null;

        function redo_visibility(w) {
            $scope.grid_opts.columnDefs[0].visible = (w > 400);
            $scope.grid_opts.columnDefs[2].visible = (w > 900);
            $scope.grid_opts.columnDefs[3].visible = (w > 500);
            $scope.grid_opts.columnDefs[4].visible = (w > 400);
            $scope.grid_opts.columnDefs[5].visible = (w > 400);
            refresh_grid();
        }

        $scope.grid_opts = {
            enableFiltering: false,
            enableSorting: false,
            enableGridMenu: false,
            enableColumnMenus: false,
            enableHorizontalScrollbar: 0,
            enableVerticalScrollbar: 0,
            rowHeight: 30,
            columnDefs: [
                {name: 'Id', field: 'id', width: 60},
                {name: 'Title', cellTemplate: '<div class="ui-grid-cell-contents"><a href="{{row.entity.url}}">{{row.entity.title}}</a></div>'},
                {name: 'description', field: 'description'},
                {name: 'Status', field: 'status', width: 90},
                {name: 'Duration', field: 'duration', width: 90},
                {name: 'Start', field: 'projstart', width: 90}
            ],
            onRegisterApi: function(gridApi){
                $scope.gridApi = gridApi;
            }
        };

        $scope.$watch(function(){
           return $window.innerWidth;
        }, function(value) {
            redo_visibility(value);
        });

        $scope.getTableHeight = function() {
            var rowHeight = 30; // your row height
            var headerHeight = 30; // your header height
            return {
                height: ($scope.grid_opts.data.length * rowHeight + headerHeight) + "px"
            };
        };

        function refresh_grid() {
            if($scope.gridApi == null)
                return;
            $scope.gridApi.core.queueRefresh();
        }

        function refresh_playlist() {
            var c_player = Player.get_current_player();
            if(c_player == null) {
                return;
            }

            var status_table = [
                'Not started',
                'Metadata',
                'Download',
                'On queue',
                'Error'
            ];

            $scope.grid_opts.data = [];
            $scope.grid_opts.minRowsToShow = 0;
            $scope.grid_opts.virtualizationThreshold = 0;

            var playlist = Playlist.get_playlist();
            var len = playlist.length;
            var start_sec = 0;
            for(var i = 0; i < len; i++) {
                var field = playlist[i];
                // Show only entries which have not yet been played by this player
                if(field.id <= c_player.last) {
                    continue;
                }
                var source = field.source;

                // Format status message
                var status = status_table[source.status];
                if(source.status == 4) {
                    status += '(' + source.message + ')'
                }

                // Format duration
                var duration = moment.duration(source.length_seconds, "seconds").format("hh:mm:ss", { trim: false });
                var projstart = moment.duration(start_sec, "seconds").format("hh:mm:ss", { trim: false });
                start_sec += source.length_seconds;

                // Add field
                $scope.grid_opts.data.push({
                    'id': i+1,
                    'title': source.title,
                    'description': source.description,
                    'status': status,
                    'duration': duration,
                    'projstart': projstart,
                    'url': 'http://youtu.be/'+source.youtube_hash
                });
            }
            $scope.grid_opts.minRowsToShow = $scope.grid_opts.data.length;
            $scope.grid_opts.virtualizationThreshold = $scope.grid_opts.data.length;
            refresh_grid();
        }

        function init() {
            var c_player = Player.get_current_player();
            Playlist.query(c_player.id);

            $rootScope.$on(SYNC_EVENTS.mediasRefresh, function(event, args) {
                refresh_playlist();
            });
            $rootScope.$on(SYNC_EVENTS.currentPlayerChange, function(event, args) {
                var c_player = Player.get_current_player();
                Playlist.query(c_player.id);
            });
            $rootScope.$on(SYNC_EVENTS.playerPlaybackChange, function(event, args) {
                refresh_playlist();
            });
        }

        init();
    }
]);
