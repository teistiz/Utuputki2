'use strict';

app.controller('StatisticsController', ['$scope', '$location', '$rootScope', 'SYNC_EVENTS', 'Statistics',
    function ($scope, $location, $rootScope, SYNC_EVENTS, Statistics) {
        $scope.ratings_api = null;

        $scope.ratings_opts = {
            enableFiltering: false,
            enableSorting: true,
            enableGridMenu: false,
            enableColumnMenus: false,
            enableHorizontalScrollbar: 0,
            enableVerticalScrollbar: 0,
            rowHeight: 30,
            columnDefs: [
                {name: 'Name', field: 'name'},
                {name: 'Skips sent', field: 'skips_sent', width: 140},
                {name: 'Skips received', field: 'skips_recv', width: 140},
                {name: 'Posts', field: 'posts', width: 140},
                {name: 'Rating', displayName: 'QUALITY index',
                 field: 'rating', width: 140, cellFilter: 'number : 2'},
            ],
            onRegisterApi: function(gridApi){
                $scope.ratings_api = gridApi;
            }
        };

        $scope.getTableHeight = function(opts) {
            var rowHeight = 30; // your row height
            var headerHeight = 30; // your header height
            return {
                height: (opts.data.length * rowHeight + headerHeight) + "px"
            };
        };

        $scope.show_ratings_table = function() {
            return ($scope.ratings_opts.data.length > 0);
        };

        function refresh_ratings() {
            $scope.ratings_opts.data = Statistics.get_ratings();
            $scope.ratings_opts.minRowsToShow = $scope.ratings_opts.data.length;
            $scope.ratings_opts.virtualizationThreshold = $scope.ratings_opts.data.length;
        }

        function init() {
            refresh_ratings();
            $rootScope.$on(SYNC_EVENTS.statsRefresh, function(event, args) {
                refresh_ratings();
            });
        }

        init();
    }
]);
