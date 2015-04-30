angular.module('starter.controllers', ['Myapp.services'])
    .controller('ActivityCtrl', function($scope, $stateParams, $timeout) {
        console.log( 'ActivityCtrl' );
        $scope.$parent.showHeader();
        $scope.$parent.clearFabs();
        $scope.isExpanded = true;
        $scope.$parent.setExpanded(true);
        $scope.$parent.setHeaderFab('right');

        $timeout(function() {
            ionic.material.motion.fadeSlideIn({
                selector: '.animate-fade-slide-in .item'
            });
        }, 200);

        // Delay expansion
        $timeout(function() {
            $scope.isExpanded = true;
            $scope.$parent.setExpanded(true);
        }, 300);

        // Set Motion
        ionic.material.motion.fadeSlideInRight();


        // Activate ink for controller
        ionic.material.ink.displayEffect();
    })
    .controller('PostCtrl', function($scope, $stateParams, $ionicPopup, $timeout) {
        console.log( 'PostCtrl' );
        $scope.$parent.showHeader();
        $scope.$parent.clearFabs();
        $scope.isExpanded = true;
        $scope.$parent.setExpanded(true);
        $scope.$parent.setHeaderFab('right');

        $scope.showPopup = function() {
            var alertPopup = $ionicPopup.alert({
                title: 'Dont eat that!',
                template: 'It might taste good'
            });
        }
        $timeout(function() {
            ionic.material.motion.fadeSlideIn({
                selector: '.animate-fade-slide-in .item'
            });
        }, 200);

        // Delay expansion
        $timeout(function() {
            $scope.isExpanded = true;
            $scope.$parent.setExpanded(true);
        }, 300);

        // Set Motion
        ionic.material.motion.fadeSlideInRight();


        // Activate ink for controller
        ionic.material.ink.displayEffect();
    })
    .controller('AlertCtrl', function($scope, $stateParams, $timeout) {
        console.log( 'AlertCtrl' );
        // Set Header
        $scope.$parent.showHeader();
        $scope.$parent.clearFabs();

        // Delay expansion
        $timeout(function() {
            $scope.isExpanded = true;
            $scope.$parent.setExpanded(true);
        }, 300);

        // Set Motion
        ionic.material.motion.fadeSlideInRight();

        // Set Ink
        ionic.material.ink.displayEffect();
    })
    .controller('SettingCtrl', function($scope, $stateParams, $timeout) {
        console.log( 'SettingCtrl' );
        // Set Header
        $scope.$parent.showHeader();
        $scope.$parent.clearFabs();

        // Delay expansion
        $timeout(function() {
            $scope.isExpanded = true;
            $scope.$parent.setExpanded(true);
        }, 300);

        // Set Motion
        ionic.material.motion.fadeSlideInRight();

        // Set Ink
        ionic.material.ink.displayEffect();
    })
    .controller( 'SearchCtrl', function($scope,$stateParams, $timeout){
        console.log( 'SearchCtrl' );
        $scope.$parent.showHeader();
        $scope.$parent.clearFabs();

        $timeout(function() {
            $scope.isExpanded = true;
            $scope.$parent.setExpanded(true);
        }, 300);
        // Set Motion
        ionic.material.motion.fadeSlideInRight();

        // Set Ink
        ionic.material.ink.displayEffect();

        $scope.data = {};
        
        $scope.items = [
            { price: '$4.99', text: 'Pizza' },
            { price: '$2.99', text: 'Burger' },
            { price: '$3.99', text: 'Pasta' },
            { price: '$2.99', text: 'Burger' },
            { price: '$3.99', text: 'Pasta' },
            { price: '$2.99', text: 'Burger' },
            { price: '$3.99', text: 'Pasta' },
            { price: '$2.99', text: 'Burger' },
            { price: '$3.99', text: 'Pasta' },
            { price: '$2.99', text: 'Burger' },
            { price: '$3.99', text: 'Pasta' },
            { price: '$2.99', text: 'Burger' },
            { price: '$3.99', text: 'Pasta' },
            { price: '$2.99', text: 'Burger' },
            { price: '$3.99', text: 'Pasta' },
            { price: '$2.99', text: 'Burger' },
            { price: '$3.99', text: 'Pasta' },
            { price: '$2.99', text: 'Burger' },
            { price: '$3.99', text: 'Pasta' },
        ];
        $scope.clearSearch = function() {
            $scope.data.searchQuery = '';
        };
    })
    .controller( 'MessagesCtrl', [ '$scope', '$location', 'LoginUser', function( $scope, $location, LoginUser ) {
        console.log( 'MessageCtrl' );
        $scope.loginUser;
        $scope.messages  = [];

        LoginUser.then( function( user ) {
            $scope.loginUser = user;

            var MessageObject = Parse.Object.extend( 'Message2' );

            var queryFrom = new Parse.Query( MessageObject );
            queryFrom.equalTo( 'from', $scope.loginUser );
            var queryTo = new Parse.Query( MessageObject );
            queryTo.equalTo( 'to', $scope.loginUser );

            var query = Parse.Query.or( queryFrom, queryTo ); // from が自分か、 to が自分のものを検索
            query.limit( 50 );
            query.descending( 'createdAt' );
            query.include( 'from' ); // from を一緒に取り出す
            query.include( 'to' );   // to を一緒に取り出す
            query.find().then( function( results ) {
                $scope.$apply( function(){
                    var uniqueUsers = {};
                    for ( var i = 0; i < results.length; i++ ) {
                        var type = (results[i].get('from').id == $scope.loginUser.id) ? 'sent' : 'received';
                        var userMessageId = (type == 'sent') // 同じ相手との重複表示を避ける
                            ? results[i].get('from').id + ':' + results[i].get('to').id
                            : results[i].get('to').id + ':' + results[i].get('from').id;
                        if ( !uniqueUsers[userMessageId] || ( uniqueUsers[userMessageId] < results[i].createdAt ) ) {
                            uniqueUsers[userMessageId] = results[i].createdAt;
                            $scope.messages.push({
                                umid   : userMessageId,
                                object : angular.copy( results[i] ),
                                type   : type
                            });
                        }
                    }
                });
            });
        });
        var UserObject = Parse.Object.extend('User2')
        var user0 = new UserObject();
        user0.set( 'name', 'user0' );
        user0.save();

        var user1 = new UserObject();
        user1.set( 'name', 'user1' );
        user1.save();

        var MessageObject = Parse.Object.extend( 'Message2' );
        var message0 = new MessageObject();
        message0.save({
            'from': user0,
            'to': user1,
            'content':"I'm gonna be there."
        })
        $scope.detail = function( msg ) {
            var user = (msg.type == 'sent') ? msg.object.get('to') : msg.object.get('from');
            $location.path( '/message/' + user.id );
        };
    }])
    .controller('AmessageCtrl', [ '$scope', '$location', '$stateParams', 'LoginUser', function( $scope, $location, $stateParams, LoginUser ) {
        console.log( 'AmessageCtrl' );
        $scope.loginUser;
        $scope.messages = [];
        LoginUser.then( function( user ) {
            $scope.loginUser  = user;

            var MessageObject = Parse.Object.extend( 'Message2' );
            var UserObject = Parse.Object.extend( 'User2' );

            var targetUser = new UserObject();
            targetUser.id = $stateParams.uid; // 特定のユーザーとのやりとりを検索

            var queryFrom = new Parse.Query( MessageObject );
            queryFrom.equalTo( 'from', $scope.loginUser );    // 自分から
            queryFrom.equalTo( 'to', targetUser );            // 特定ユーザー

            var queryTo = new Parse.Query( MessageObject );
            queryTo.equalTo( 'from', targetUser );            // 特定ユーザーから
            queryTo.equalTo( 'to', $scope.loginUser );

            console.log(targetUser)        // 自分

            var query = Parse.Query.or( queryFrom, queryTo ); // のいずれか
            query.limit( 50 );
            query.descending( 'createdAt' );
            query.include( 'from' );
            query.include( 'to' );
            query.find().then( function( results ) {
                $scope.$apply( function(){
                    for ( var i = 0; i < results.length; i++ ) {
                        var type = (results[i].get('from').id == $scope.loginUser.id) ? 'sent' : 'received';
                        $scope.messages.push({
                            object : angular.copy( results[i] ),
                            type   : type,
                            user   : user
                        });
                        if ( !$scope.targetUser ) {
                            $scope.targetUser = (type == 'sent') ? results[i].get('to') : results[i].get('from');
                        }
                    }
                });
            });
        });

        $scope.back = function() {
            $location.path( '/' );
        };
    }])
    .controller( 'DiseaseCtrl', ['$scope', function($scope){
        console.log( 'DiseaseCtrl' );
        $scope.diseases = [
            { 
                name : "Distal Myopathy", 
                medicine : "MIDAZOLAM,",
                photo : "Userphoto", },
        ];
    } ] )
    .controller( 'MedicineCtrl', ['$scope', function($scope){
        console.log( 'MedicineCtrl' );
        $scope.medicines = [
            { 
                company : "Novartis Pharl", 
                medicine : "Glivec", },
        ];
    }])
    .controller('ProfileCtrl', function($scope, $stateParams, $timeout) {
        console.log( 'ProfileCtrl' );
        $scope.$parent.showHeader();
        $scope.$parent.clearFabs();
        $scope.isExpanded = false;
        $scope.$parent.setExpanded(false);
        $scope.$parent.setHeaderFab(false);
        // Set Motion
        $timeout(function() {
            ionic.material.motion.slideUp({
                selector: '.slide-up'
            });
        }, 300);

        $timeout(function() {
            ionic.material.motion.fadeSlideInRight({
                startVelocity: 2000
            });
        }, 800);
        // Set Ink
        ionic.material.ink.displayEffect();
    })
    .controller( 'SignupCtrl', function( $scope, $timeout, $location ) {
        console.log( 'SignupCtrl' );
        Parse.User.logOut();
        $scope.user = { name: '', password: '', email: '' };
        $scope.signup = function() {
            var user = new Parse.User();
            user.set( 'username', $scope.user.name );
            user.set( 'email', $scope.user.email );
            user.set( 'password', $scope.user.password );
            user.signUp(null, {
                success: function(user) {
                    $scope.$apply( function(){
                        $scope.username = '';
                        $scope.password = '';
                        $scope.email    = '';
                        $scope.error    = '';
                        console.log(user);
                        $location.path( '/main' );
                    });
                },
                error: function(user, error) {
                    // Show the error message somewhere and let the user try again.
                    $timeout( function(){
                        $scope.error = error.message;
                    }, 100);
                    alert("Error: " + error.code + " " + error.message);
                }
            });
        };
        // Triggered in the login modal to close it
        $scope.closeLogin = function() {
            $scope.modal.hide();
        };
        // Open the login modal
        $scope.login = function() {
            $location.path('/login');
        };
        // Perform the login action when the user submits the login form
        $scope.doLogin = function() {
            console.log('Doing login', $scope.loginData);
            // Simulate a login delay. Remove this and replace with your login
            // code if using a login system
            $timeout(function() {
                $scope.closeLogin();
            }, 1000);
        };
        $scope.fbLogin = function() {
            openFB.login(
                function(response) {
                    if (response.status === 'connected') {
                        console.log('Facebook login succeeded');
                        $scope.closeLogin();
                        $location.path('/activity');

                    } else {
                        alert('Facebook login failed');
                    }
                },
                {scope: 'email,publish_actions'});
        }
        $scope.back = function () {
            $location.path('/');

        };
    })
    .controller( 'LoginCtrl', function( $scope, $location, $rootScope, $timeout, AUTH_EVENTS, AuthService) {
        console.log( 'LoginCtrl' );
        Parse.User.logOut();
        $scope.$parent.showHeader();
        $scope.$parent.clearFabs();
        $scope.isExpanded = true;
        $scope.$parent.setExpanded(true);
        

        $scope.credentials = {  username: '', password: ''};
        $scope.login = function (credentials) {
            AuthService.login(credentials).then(function (user) {
                $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                $scope.setCurrentUser(user);
            }, function () {
                $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
            });
        };
        $rootScope.$on( AUTH_EVENTS.loginSuccess, function(){
            $timeout(function() {
                $location.path('/main');
            },100);
        });
        $scope.fbLogin = function(credentials) {
            openFB.login(
                function(response, user) {
                    if (response.status === 'connected') {
                        console.log('Facebook login succeeded');
                        $scope.closeLogin();
                        $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                        $scope.setCurrentUser(user);
                        $location.path('/main');
                    } else {
                        $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                        alert('Facebook login failed');
                    }
                },
                {scope: 'email,publish_actions'});
        };
        $scope.closeLogin = function() {
            $scope.modal.hide();
        };
        $scope.doLogin = function() {
            console.log('Doing login', $scope.loginData);

            // Simulate a login delay. Remove this and replace with your login
            // code if using a login system
            $timeout(function() {
                $scope.closeLogin();
            }, 1000);
        };
        $scope.signup = function () {
            $location.path('/signup');

        };
        $scope.back = function () {
            $location.path('/');
        };
    })
    .controller( 'AppCtrl',function($scope, $state, $ionicSlideBoxDelegate, $location, USER_ROLES, AuthService){
        console.log( 'AppCtrl' );
        $scope.currentUser = null;
        $scope.userRoles = USER_ROLES;
        $scope.isAuthorized = AuthService.isAuthorized;            
        $scope.loginData = {};
        $scope.isExpanded = false;
        $scope.hasHeaderFabLeft = false;
        $scope.hasHeaderFabRight = false;

        $scope.setCurrentUser = function (user) {
            $scope.currentUser = user;
        }
        // Create the login modal that we will use later
        var navIcons = document.getElementsByClassName('ion-navicon');
        for (var i = 0; i < navIcons.length; i++) {
            navIcons.addEventListener('click', function() {
                this.classList.toggle('active');
            });
        }
        // Open the login modal
        $scope.login = function() {
            $location.path('/login')
        };
        $scope.hideNavBar = function() {
            document.getElementsByTagName('ion-nav-bar')[0].style.display = 'none';
        };
        $scope.showNavBar = function() {
            document.getElementsByTagName('ion-nav-bar')[0].style.display = 'block';
        };
        $scope.noHeader = function() {
            var content = document.getElementsByTagName('ion-content');
            for (var i = 0; i < content.length; i++) {
                if (content[i].classList.contains('has-header')) {
                    content[i].classList.toggle('has-header');
                }
            }
        };
        $scope.setExpanded = function(bool) {
            $scope.isExpanded = bool;
        };
        $scope.setHeaderFab = function(location) {
            var hasHeaderFabLeft = false;
            var hasHeaderFabRight = false;

            switch (location) {
            case 'left':
                hasHeaderFabLeft = true;
                break;
            case 'right':
                hasHeaderFabRight = true;
                break;
            }

            $scope.hasHeaderFabLeft = hasHeaderFabLeft;
            $scope.hasHeaderFabRight = hasHeaderFabRight;
        };
        $scope.hasHeader = function() {
            var content = document.getElementsByTagName('ion-content');
            for (var i = 0; i < content.length; i++) {
                if (!content[i].classList.contains('has-header')) {
                    content[i].classList.toggle('has-header');
                }
            }
        };
        $scope.hideHeader = function() {
            $scope.hideNavBar();
            $scope.noHeader();
        };
        $scope.showHeader = function() {
            $scope.showNavBar();
            $scope.hasHeader();
        };
        $scope.clearFabs = function() {
            var fabs = document.getElementsByClassName('button-fab');
            if (fabs.length && fabs.length > 1) {
                fabs[0].remove();
            }
        };
    })
    .controller( 'IntroCtrl',function($scope, $state, $stateParams, $ionicSlideBoxDelegate, 
                                      $ionicModal, $timeout, $location, Session){
        console.log( 'IntroCtrl' );
        $scope.$parent.clearFabs();
        $scope.isExpanded = false;
        $scope.$parent.setExpanded(false);
        $timeout(function() {
            ionic.material.motion.fadeSlideIn({
                selector: '.animate-fade-slide-in .item'
            });
        }, 200);
        // Delay expansion
        $timeout(function() {
            $scope.isExpanded = true;
            $scope.$parent.setExpanded(true);
        }, 300);
        // Set Motion
        ionic.material.motion.fadeSlideInRight();
        // Activate ink for controller
        ionic.material.ink.displayEffect();
        // Delay expansion
        $timeout(function() {
            $scope.isExpanded = true;
            $scope.$parent.setExpanded(true);
        }, 300);
        // Set Motion
        ionic.material.motion.fadeSlideInRight();
        // Set Ink
        ionic.material.ink.displayEffect();
        // Called to navigate to the main app
        $scope.startApp = function() {
            $location.path('/signup');
        };
        $scope.next = function() {
            $ionicSlideBoxDelegate.next();
        };
        $scope.previous = function() {
            $ionicSlideBoxDelegate.previous();
        };
        // Called each time the slide changes
        $scope.slideChanged = function(index) {
            $scope.slideIndex = index;
        };
        $scope.signup = function() {
            $location.path( '/signup' );
        };
        $scope.login = function() {
            $location.path( '/login' );
        };
    })

