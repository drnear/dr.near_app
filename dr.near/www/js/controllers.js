angular.module('DrNEAR.controllers', ['ngCordova','DrNEAR.services'])
    .controller( 'AppCtrl', function(
        $scope, $state, $ionicSlideBoxDelegate, $location,
        ionicMaterialMotion, ionicMaterialInk, Session, USER_ROLES
    ){
        this.session = Session;
    })

    .controller( 'ActivityCtrl', function(
        $scope, $stateParams, $timeout,
        ionicMaterialMotion, ionicMaterialInk, Session
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
                }, 10);
                $timeout( function(){
                    ionicMaterialMotion.fadeSlideIn({
                        selector: '.animate-fade-slide-in .item'
                    });
                    ionicMaterialInk.displayEffect();
                }, 20);
            },
            function( err ) {
                console.log( 'err', err );
            }
        );
    })

    .controller( 'ActivityPostCtrl', function(
        $scope, $state, $stateParams, $timeout,
        ionicMaterialMotion, ionicMaterialInk, Session
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
        $scope, $stateParams, $timeout,
        ionicMaterialMotion, ionicMaterialInk
    ) {
        console.log( 'AlertCtrl' );

        // Set Motion
        ionicMaterialMotion.fadeSlideInRight();

        // Set Ink
        ionicMaterialInk.displayEffect();
    })

    .controller( 'SettingCtrl', function(
        $scope, $stateParams, $timeout,
        ionicMaterialMotion, ionicMaterialInk
    ) {
        console.log( 'SettingCtrl' );
        // Set Motion
        ionicMaterialMotion.fadeSlideInRight();

        // Set Ink
        ionicMaterialInk.displayEffect();
    })

    .controller( 'MessagesCtrl', function( $scope, $location ) {
        console.log( 'MessageCtrl' );
    })

    .controller('AmessageCtrl', function( $scope, $location, $stateParams ) {
        console.log( 'AmessageCtrl' );
    })

    .controller('ProfileCtrl', function(
        $scope, $stateParams, $timeout,
        ionicMaterialMotion, ionicMaterialInk
    ) {
        console.log( 'ProfileCtrl' );
        $timeout(function() {
            ionicMaterialMotion.slideUp({
                selector: '.slide-up'
            });
        }, 300);

        $timeout(function() {
            ionicMaterialMotion.fadeSlideInRight({
                startVelocity: 2000
            });
        }, 800);
        // Set Ink
        ionicMaterialInk.displayEffect();
    })

    .controller('ProfEditCtrl', function( $state, $cordovaCamera, Session ) {
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
            var iconHandler = document.getElementById('icon-handler').files[0];
            var iconFile = new Parse.File( iconHandler.name, iconHandler );
            user.set( 'username', Session.username );
            user.set( 'icon', iconFile );
            user.save().then( function(){
                Session.update( user );
                $state.go( 'app.profile' );
            }, function(err){
                console.log( err );
            });
        };
    })

    .controller( "ProfEditDiseasesCtrl", function( $timeout ){
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

            user.relation("diseases").add(disease);

            user.save().then(function(obj){
                disease.relation("followers").add(user);
                disease.save().then(function(obj){
                    console.log('saving disease succeeded',obj);
                }, function(err){
                    console.log('saving disease failed',err);
                    userDiseases.remove(disease);
                });
            },function(err){
                console.log('saving user failed',err);
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

        $timeout(function() {
            ionicMaterialMotion.fadeSlideIn({
                selector: '.animate-fade-slide-in .item'
            });
        }, 200);
        // Delay expansion
        $timeout(function() {
            $scope.isExpanded = true;
            $scope.$parent.setExpanded(true);
        }, 300);
        // Set Motion
        ionicMaterialMotion.fadeSlideInRight();
        // Activate ink for controller
        ionicMaterialInk.displayEffect();
        // Delay expansion
        $timeout(function() {
            $scope.isExpanded = true;
            $scope.$parent.setExpanded(true);
        }, 300);
        // Set Motion
        ionicMaterialMotion.fadeSlideInRight();
        // Set Ink
        ionicMaterialInk.displayEffect();
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
