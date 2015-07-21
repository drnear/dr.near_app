angular.module('DrNEAR.controllers', ['ngCordova','DrNEAR.services'])
    .controller( 'AppCtrl', function(
        $scope, $state, $ionicSlideBoxDelegate, $location,
        Session, USER_ROLES
    ){
        this.session = Session;
    })

    .controller( 'ActivityCtrl', function(
        $scope, $stateParams, $timeout, Session
    ) {
        this.items = [];
        var context = this;

        var Activity = Parse.Object.extend( 'Activity' );
        var query = new Parse.Query( Activity );
        query.limit( 10 );
        query.descending( 'createdAt' );
        query.find().then(
            function( results ) {
                $timeout( function(){
                    context.items.splice(0);
                    for ( var i = 0; i < results.length; i++ ) {
                        context.items.push( results[i] );
                    }
                });
            },
            function( err ) {
                console.log( 'err', err );
            }
        );
    })

    .controller( 'ActivityPostCtrl', function(
        $scope, $state, $stateParams, $timeout, Session
    ) {
        var context = this;

        this.post = function( entry ) {
            var Activity = Parse.Object.extend( 'Activity' );
            var activity = new Activity();
            var user     = Parse.User.current();

            var acl = new Parse.ACL( user );
            acl.setPublicReadAccess( true );
            activity.setACL( acl );

            activity.set( 'title',   entry.title );
            activity.set( 'content', entry.content );
            activity.set( 'user',    user );

            activity.save().then(function(){
                $timeout( function(){
                    $state.go( 'app.activity' );
                },100);
            });
        };
    })

    .controller( 'AlertCtrl', function(
        $scope, $stateParams, $timeout
    ) {
        console.log( 'AlertCtrl' );
    })

    .controller( 'SearchCtrl', function( $timeout ){
        var context = this;
        context.searchWord = '';
        context.users      = [];
        context.diseases   = [];
        context.timer = undefined;

        context.search = function(){
            if (context.timer !== undefined) {
                $timeout.cancel(context.timer);
                context.timer = undefined;
            }

            context.users.splice(0);
            context.diseases.splice(0);

            if ( context.searchWord === '' ) {
                return;
            }

            context.timer = $timeout(function(){
                var userQuery = new Parse.Query(Parse.User);
                userQuery.matches( "username", new RegExp(".*" + context.searchWord + ".*") );
                userQuery.notEqualTo( "id", Parse.User.current().id );
                userQuery.find().then(function(users){
                    $timeout(function(){
                        context.users = users;
                    },100);
                });

                var diseaseQuery = new Parse.Query(Parse.Object.extend("Disease"));
                diseaseQuery.matches( "name", new RegExp(".*" + context.searchWord + ".*") );
                diseaseQuery.find().then(function(diseases){
                    $timeout(function(){
                        context.diseases = diseases;
                    });
                });
            },500);
        };
    })

    .controller('ProfileCtrl', function(
        $scope, $stateParams, $timeout
    ) {
        console.log( 'ProfileCtrl' );
        var context = this;

        context.myposts = [];

        var Activity = Parse.Object.extend( 'Activity' );
        var query = new Parse.Query( Activity );
        query.limit( 10 );
        query.descending( 'createdAt' );
        query.equalTo( 'user', Parse.User.current() );
        query.find().then(
            function( results ) {
                $timeout( function(){
                    context.myposts.splice(0);
                    for ( var i = 0; i < results.length; i++ ) {
                        context.myposts.push( results[i] );
                    }
                });
            },
            function( err ) {
                console.log( 'err', err );
            }
        );
    })

    .controller('ProfEditCtrl', function( $state, $cordovaCamera, $timeout, Session ) {
        console.log( 'ProfEditCtrl', Parse.User.current() );
        var context = this;

        this.useCamera = function() {
            console.log('useCamera');
            var options = {
                quality: 50,
                destinationType  : 0,    // 0:DATA_URL, 1:, 2:
                sourceType       : 0,    // 0:LIBRARY, 1:CAMERA, 2:ALBUM
                allowEdit        : true,
                encodingType     : 0,    // JPEG
                targetWidth      : 100,
                targetHeight     : 100,
                popoverOptions   : {},
                saveToPhotoAlbum : false
            };
            $cordovaCamera.getPicture(options).then(function(imageData) {
                document.getElementById('icon-image').src = "data:image/jpeg;base64," + imageData;
            }, function(err) {
                // error
            });
        };

        this.selectIcon = function() {
            document.getElementById('icon-handler').click();
        };

        this.uploadIcon = function( iconElem ) {
            if ( iconElem.files[0] ) {
                var reader = new FileReader();
                reader.onload = function(ev){
                    document.getElementById('icon-image').src = ev.target.result;
                };
                reader.readAsDataURL( iconElem.files[0] );
            }
        };

        this.update = function() {
            var user = Parse.User.current();
            user.set( 'name', Session.name );

            var iconHandler = document.getElementById('icon-handler').files[0];
            if ( iconHandler && iconHandler.name ) {
                var iconFile = new Parse.File( iconHandler.name, iconHandler );
                user.set( 'icon', iconFile );
            }

            user.save().then( function(saved){
                $timeout(function(){
                    Session.update( saved );
                    $state.go( 'app.profile' );
                });
            }, function(err){
                console.log( err );
            });
        };

        this.delete_disease = function( item ) {
            var user = Parse.User.current();
            user.relation('diseases').remove(item);
            user.save().then(function(saved){
                console.log(saved);
                $timeout(function(){
                    Session.update(saved);
                });
            });
        };
    })

    .controller( "ProfEditDiseasesCtrl", function( $state, $timeout, Session ){
        var Disease = Parse.Object.extend('Disease');

        var context = this;
        context.disease    = '';
        context.candidates = [];
        context.searchlock = undefined;

        context.search = function(){
            if ( typeof(context.searchlock) != 'undefined' ) {
                $timeout.cancel( context.searchlock );
            }
            context.searchlock = $timeout( function(){
                context.candidates.splice(0);
                if ( context.disease !== '' ) {
                    var query = new Parse.Query(Disease);
                    query.matches("name", new RegExp('.*'+context.disease+'.*'));
                    query.find().then(function(res){
                        $timeout(function(){
                            for ( var i = 0; i < res.length; i++ ) {
                                context.candidates.push( res[i] );
                            }
                        });
                    },function(err){console.log('err',err);});
                }
            }, 500 );
        };

        context.select = function( disease ){
            var user = Parse.User.current();

            disease.relation("followers").add(user);
            disease.save().then(function(saved){
                console.log('saving disease succeeded',saved);
                user.relation("diseases").add(saved);
                user.save().then(function(saved){
                    $timeout(function(){
                        Session.update(saved);
                        $state.go('app.profedit');
                    });
                },function(err){
                    console.log('saving user failed',err);
                });

            }, function(err){
                console.log('saving disease failed',err);
                disease.relation('followers').remove(user);
                disease.save();
            });

        };

        context.create = function() {
            var query = new Parse.Query( Disease );
            query.equalTo("name",context.disease);
            query.first().then(function(res){
                if ( res ) {
                    console.log( 'first', res );
                    // context.select( res);
                }
                else {
                    var disease = new Disease();
                    disease.set( "name", context.disease );
                    disease.save().then(function(obj){
                        context.select( obj );
                    });
                }

            }, function(err){
                var disease = new Disease();
                disease.set( "name", context.disease );
                disease.save().then(function(obj){
                    context.select( obj );
                });
            });
        };
    })

    .controller( 'SettingCtrl', function() {
        console.log( 'SettingCtrl' );
    })

    .controller( 'SettingPasswordCtrl', function() {
        console.log( 'SettingPasswordCtrl' );
    })

    .controller( 'MessagesCtrl', function( $scope, $location ) {
        console.log( 'MessageCtrl' );
    })

    .controller('AmessageCtrl', function( $scope, $location, $stateParams ) {
        console.log( 'AmessageCtrl' );
    })

    .controller( 'SignupCtrl', function( $scope, $timeout, $location ) {
        console.log( 'SignupCtrl' );
        Parse.User.logOut();
        $scope.user = { name: '', password: '', email: '' };
        $scope.signup = function() {
            var user = new Parse.User();
            user.set( 'username', $scope.user.username );
            user.set( 'name', $scope.user.name );
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
        };
        $scope.back = function () {
            $location.path('/');

        };
    })

    .controller( 'LoginCtrl', function( $scope, $state, $location, $rootScope, $timeout, Session, AUTH_EVENTS ) {
        Parse.User.logOut();
        Session.destroy();

        this.credentials = { username: '', password: ''};

        var context = this;
        this.login = function () {
            Parse.User.logIn( context.credentials.username, context.credentials.password )
                .then( function( user ) {
                    Session.create( user );
                    $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                }, function(err) {
                    $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                });
        };

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
        this.signup = function () {
            $state.go('signup');
        };
        $scope.back = function () {
            $location.path('/');
        };
    })

    .controller( 'IntroCtrl',function($scope, $state, $stateParams, $ionicSlideBoxDelegate,
                                      $ionicModal, $timeout, $location){
        console.log( 'IntroCtrl' );
        $scope.$parent.clearFabs();
        $scope.isExpanded = false;
        $scope.$parent.setExpanded(false);
        $scope.$parent.setHeaderFab(false);

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
    });
