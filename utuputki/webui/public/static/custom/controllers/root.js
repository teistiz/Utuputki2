'use strict';

app.run(['$rootScope', '$location', 'AuthService', 'SockService', 'Session', 'SourceQueue', 'Player', 'Event',
         'Playlist', 'Statistics', 'UserList', 'AUTH_EVENTS', 'USERLEVELS',
    function($rootScope, $location, AuthService, SockService, Session, SourceQueue, Player, Event, Playlist,
              Statistics, UserList, AUTH_EVENTS, USERLEVELS) {

        // Make sure we are logged in the next page requires that
        $rootScope.$on('$routeChangeStart', function (event, next, current) {
            if(next.requireLogin) {
                if(!AuthService.is_authenticated()) {
                    if(next.originalPath != '/login' || current.originalPath != '/') {
                        event.preventDefault();
                        $location.path('/login');
                    }
                }
                if(next.requireAdmin && !AuthService.is_authorized(USERLEVELS['admin'])) {
                    if(next.originalPath != '/login' || current.originalPath != '/') {
                        event.preventDefault();
                        $location.path('/login');
                    }
                }
            }
        });

        // If we hear and event about login failing, just redirect back to /login page
        $rootScope.$on(AUTH_EVENTS.loginFailed, function (event, args) {
            $location.path("/login");
        });

        // ... Same with session timing out
        $rootScope.$on(AUTH_EVENTS.sessionTimeout, function (event, args) {
            $location.path("/login");
        });

        // Add a listener for our sockjs socket opening.
        SockService.add_open_handler(function () {
            // Attempt to reconstruct session from localStorage
            if (localStorage.getItem("sid") != null) {
                Session.create(localStorage.getItem("sid"), 0, 0);
                AuthService.authenticate();
            }
        });

        // Initialize our services
        SockService.setup();
        SourceQueue.setup();
        Event.setup();
        Player.setup();
        Playlist.setup();
        Statistics.setup();
        AuthService.setup();
        UserList.setup();

        // Synchronize global session_id to AuthService.session_id
        $rootScope.session_id = AuthService.session_id;
    }
]);