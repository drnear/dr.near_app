angular.module('DrNEAR.controllers', ['ngCordova','DrNEAR.services'])
    .controller( 'AppCtrl', function(
        $timeout, Session
    ){
        var ctrl = this;
        ctrl.session = Session;

        ctrl.isFollowing = function( target ) {
            return Session.user.isFollowing( target );
        };

        ctrl.toggleFollowing = function( target ) {
            Session.user.toggleFollowing( target ).then(function(saved){
                console.log('toggleFollowing');
                Session.update();
            });
        };
    })

    .controller( 'ActivityCtrl', function(
        $scope, $stateParams, $timeout, Session, Activity, FollowingDisease
    ) {
        this.items = [];
        var ctrl = this;

        Session.user.fetchFollowings().then(function(followings){
            Session.user.fetchDiseases().then( function(diseases){
                var diseaseCommunityQuery = new Parse.Query( FollowingDisease );
                diseaseCommunityQuery.containedIn( 'to', diseases.map(function(item){ return item.get('to'); }) );
                diseaseCommunityQuery.find().then(function(communityRelations){
                    var query = new Parse.Query( Activity );
                    query.limit( 20 );
                    query.descending( 'createdAt' );

                    query.containedIn( 'user', followings.map(function(item){
                        return item.get('to');
                    }).concat( communityRelations.map(function(item){
                        return item.get('from');
                    }).concat( Session.user.object )));

                    query.include( 'user' );
                    query.find().then(
                        function( results ) {
                            $timeout( function(){
                                ctrl.items = results;
                            });
                        },
                        function( err ) {
                            console.log( 'err', err );
                        }
                    );
                });
            });
        });
        ctrl.toggleComment = function( item ) {
            console.log( 'comment' );
            console.log( item.id );

            if(!item.showReply) {
                var CommentObject = Parse.Object.extend("CommentObject");
                var query = new Parse.Query( CommentObject );

                query.equalTo("commentTo",item.id);
                query.descending( 'createdAt' );
                query.find({
                    success: function( replies ) {
                        item.comments = replies;
                        item.showReply = !item.showReply;
                        $scope.$apply();
                    },
                    error : function( err ) {
                        console.log( err );
                    }
                });
            } else {
                item.showReply = !item.showReply;
            }
        }
    })

    .controller( 'ActivityPostCtrl', function(
        $scope, $state, $stateParams, $timeout, Session
    ) {
        var ctrl = this;

        this.post = function( entry ) {
            var Activity = Parse.Object.extend( 'Activity' );
            var activity = new Activity();
            var user     = Session.user.object;

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

    .controller( 'SearchCtrl', function( $timeout, FollowingUser, FollowingDisease, Session ) {
        var ctrl = this;
        ctrl.searchWord = '';
        ctrl.users      = [];
        ctrl.diseases   = [];
        ctrl.timer = undefined;

        ctrl.search = function(){
            if (ctrl.timer !== undefined) {
                $timeout.cancel(ctrl.timer);
                ctrl.timer = undefined;
            }

            ctrl.users.splice(0);
            ctrl.diseases.splice(0);

            if ( ctrl.searchWord === '' ) {
                $timeout(function(){
                    ctrl.users.splice(0);
                    ctrl.diseases.splice(0);
                });
                return;
            }

            ctrl.timer = $timeout(function(){
                var userQuery = new Parse.Query(Parse.User);
                userQuery.matches( "name", new RegExp(".*" + ctrl.searchWord + ".*",'i') );
                userQuery.notEqualTo( "objectId", Session.user.object.id );
                userQuery.find().then(function(users){
                    $timeout(function(){
                        ctrl.users = users;
                    },100);
                });

                var diseaseQuery = new Parse.Query(Parse.Object.extend("Disease"));
                diseaseQuery.matches( "name", new RegExp(".*" + ctrl.searchWord + ".*",'i') );
                diseaseQuery.find().then(function(diseases){
                    $timeout(function(){
                        ctrl.diseases = diseases;
                    });
                });
            },500);
        };
    })

    .controller('ProfileCtrl', function(
        $scope, $stateParams, $timeout, Activity
    ) {
        console.log( 'ProfileCtrl' );
        var ctrl = this;
        ctrl.view = 'activity';
        ctrl.activities = [];

        var query = new Parse.Query( Activity );
        query.limit( 10 );
        query.descending( 'createdAt' );
        query.equalTo( 'user', Parse.User.current() );
        query.include( 'user' );
        query.find().then(
            function( results ) {
                $timeout( function(){
                    ctrl.activities.splice(0);
                    for ( var i = 0; i < results.length; i++ ) {
                        ctrl.activities.push( results[i] );
                    }
                });
            },
            function( err ) {
                console.log( 'err', err );
            }
        );
    })

    .controller('ProfEditCtrl', function( $state, $cordovaCamera, $timeout, Session ) {
        var ctrl = this;

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
            Session.user.save().then(function(saved){
                $timeout(function(){
                    $state.go( 'app.profile' );
                });
            },function(err){
                console.log(err);
            });
        };
    })

    .controller( "ProfEditDiseasesCtrl", function( $state, $timeout, Session ){
        var Disease = Parse.Object.extend('Disease');

        var ctrl = this;
        ctrl.disease    = '';
        ctrl.candidates = [];
        ctrl.searchlock = undefined;

        ctrl.search = function(){
            if ( typeof(ctrl.searchlock) != 'undefined' ) {
                $timeout.cancel( ctrl.searchlock );
            }
            ctrl.searchlock = $timeout( function(){
                ctrl.candidates.splice(0);
                if ( ctrl.disease !== '' ) {
                    var query = new Parse.Query(Disease);
                    query.matches("name", new RegExp('.*'+ctrl.disease+'.*'));
                    query.find().then(function(res){
                        $timeout(function(){
                            for ( var i = 0; i < res.length; i++ ) {
                                ctrl.candidates.push( res[i] );
                            }
                        });
                    },function(err){console.log('err',err);});
                }
            }, 500 );
        };

        ctrl.select = function( disease ){
            var user = Parse.User.current();

            disease.relation("followers").add(user);
            disease.save().then(function(saved){
                console.log('saving disease succeeded',saved);
                user.relation("diseases").add(saved);
                user.save().then(function(saved){
                    $timeout(function(){
                        console.log('select');
                        Session.update();
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

        ctrl.create = function() {
            var query = new Parse.Query( Disease );
            query.equalTo("name",ctrl.disease);
            query.first().then(function(res){
                if ( res ) {
                    console.log( 'first', res );
                    // ctrl.select( res);
                }
                else {
                    var disease = new Disease();
                    disease.set( "name", ctrl.disease );
                    disease.save().then(function(obj){
                        ctrl.select( obj );
                    });
                }

            }, function(err){
                var disease = new Disease();
                disease.set( "name", ctrl.disease );
                disease.save().then(function(obj){
                    ctrl.select( obj );
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

    .controller( 'MessageListCtrl', function( Session, Message, $timeout, $state ) {
        var ctrl = this;
        ctrl.usersAndMessages = [];

        // この方式ではなく、スレッド展開中のユーザーリストを持つ方が処理効率が良い

        var messageToUser = new Parse.Query( Message );
        messageToUser.equalTo( "from", Session.user.object );

        var messageFromUser = new Parse.Query( Message );
        messageFromUser.equalTo( "to", Session.user.object );

        var query = Parse.Query.or( messageToUser, messageFromUser );
        query.include( "from", "to" );
        query.descending( "createdAt" );
        query.find({
            success: function( messages ) {
                $timeout( function(){
                    ctrl.usersAndMessages.splice(0);
                    var users = {};
                    for ( var i = 0; i < messages.length; i++ ) {
                        var user = messages[i].get("from").id == Session.user.object.id ? messages[i].get("to") : messages[i].get("from");
                        if ( users[user.id] ) {
                            continue;
                        }
                        else {
                            ctrl.usersAndMessages.push({
                                "user"   : user,
                                "message": messages[i]
                            });
                            users[user.id] = true;
                        }
                    }
                });
            }
        });

        ctrl.openThread = function( user ) {
            $state.go( 'app.message_thread', { uid: user.id } );
        };
    })

    .controller( 'MessageAppendCtrl', function( Session, FollowingUser, $timeout, $state ) {
        var ctrl = this;
        ctrl.users = [];

        if ( ! Session.user ) {
            return;
        }

        // from か to にログインユーザーを含む FollowingUser データを探す
        var queryFrom = new Parse.Query(FollowingUser);
        queryFrom.equalTo( "from", Session.user.object );

        var queryTo = new Parse.Query( FollowingUser );
        queryTo.equalTo( "to", Session.user.object );

        var query = Parse.Query.or(queryFrom, queryTo);
        query.include( "from", "to" );
        query.find({
            success: function( users ) {
                if ( users.length <= 0 ) {
                    console.log( 'no users' );
                    return;
                }
                $timeout(function(){
                    ctrl.users.splice(0);
                    var crossCheck = {};
                    for ( var i = 0; i < users.length; i++ ) {
                        // フォローの方向
                        var direction = users[i].get("from").id == Session.user.object.id ? 'from' : 'to';
                        // 相手（自分ではないほう）
                        var user      = users[i].get("from").id == Session.user.object.id ? users[i].get("to") : users[i].get("from");

                        if ( crossCheck[user.id] ) {
                            if ( crossCheck[user.id] != direction ) { // 相互フォローを確認したら
                                ctrl.users.push( user ); // ctrl.users にユーザーを追加
                            }
                        }
                        else {
                            crossCheck[user.id] = direction; // フォロー方向を保持
                        }
                    }
                });
            },
            error: function( error ) {
                cosnole.log( error );
            }
        });

        ctrl.openThread = function( user ) {
            $state.go( 'app.message_thread', { uid: user.id } );
        };
    })

    .controller('MessageThreadCtrl', function( Session, User, Message, $stateParams, $timeout ) {
        var ctrl = this;

        ctrl.messages = [];

        // 表示
        var getUserQuery = new Parse.Query( User );
        getUserQuery.get( $stateParams.uid, {
            success: function( user ){
                var messageFromUser = new Parse.Query( Message );
                messageFromUser.equalTo( "from", user );
                messageFromUser.equalTo( "to", Session.user.object );

                var messageToUser = new Parse.Query( Message );
                messageToUser.equalTo( "from", Session.user.object );
                messageToUser.equalTo( "to", user );

                var query = Parse.Query.or( messageFromUser, messageToUser );
                query.include( "from", "to" );
                query.limit( 50 );
                query.descending( "createdAt" );
                query.find({
                    success: function( messages ) {
                        console.log( messages );
                        $timeout( function(){
                            ctrl.messages.splice(0);
                            for ( var i = 0; i < messages.length; i++ ) {
                                ctrl.messages.push( messages[i] );
                            }
                        });
                    },
                    error: function( err ) {
                        console.log( err );
                    }
                });
            },
            error: function( err ) {
                console.log( err );
            }
        });

        // 送信
        ctrl.send = function( message ) {
            var msg = new Message();
            var u = new User();
            u.id = $stateParams.uid;
            msg.save({
                from    : Session.user.object,
                to      : u,
                content : message
            }).then(function(){
                $timeout( function(){
                    ctrl.messageField = '';
                });
            });
        };
    })

    .controller( 'SignupCtrl', function( $scope, $timeout, $state, $rootScope, $cordovaFacebook, AUTH_EVENTS, Session) {
        Session.destroy();

        this.credentials = {username: '', email:'', password:''};

        var ctrl = this;
        ctrl.signup = function(credentials) {
            console.log( 'signup' );
            var user = new Parse.User();
            user.set( 'username', ctrl.credentials.username );
            user.set( 'email', ctrl.credentials.email );
            user.set( 'password', ctrl.credentials.password );
            user.signUp(null, {
                success: function( user ) {
                    console.log('signup');
                    Session.update();
                    console.log( 'success and update', Session);
                    $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                },
                error: function(user, error) {
                    console.log(error);
                    $timeout( function(){
                    $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                    });
                }
            });
        };
        // Triggered in the login modal to close it
        $scope.closeLogin = function() {
            $scope.modal.hide();
        };
        // Open the login modal
        $scope.login = function() {
            $state.go('app.login');
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
        ctrl.fbLogin = function(){
         
          //Browser Login
          if(!(ionic.Platform.isIOS() || ionic.Platform.isAndroid())){         
            Parse.FacebookUtils.logIn(null, {
              success: function(user) {
                console.log(user);
                Session.update();
                console.log( 'success and update',Session);
                $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
              },
              error: function(user, error) {
                $timeout( function(){
                    $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                });                
              }
            });
         
          } 
          //Native Login
          else {
         
            $cordovaFacebook.login(["public_profile", "email"]).then(function(success){
         
              console.log(success);
         
              //Need to convert expiresIn format from FB to date
              var expiration_date = new Date();
              expiration_date.setSeconds(expiration_date.getSeconds() + success.authResponse.expiresIn);
              expiration_date = expiration_date.toISOString();
         
              var facebookAuthData = {
                "id": success.authResponse.userID,
                "access_token": success.authResponse.accessToken,
                "expiration_date": expiration_date
              };
         
              Parse.FacebookUtils.logIn(facebookAuthData, {
                success: function(user) {
                  console.log(user);
                  Session.update();
                  console.log( 'success and update', Session);
                  $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                },
                error: function(user, error) {
                  $timeout( function(){
                    $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                  });
                }
              });
         
            }, function(error){
              console.log(error);
            });
         
          }
         
        };
        $scope.back = function () {
            $state.go('app.intro');
        };
    })

    .controller( 'LoginCtrl', function( $scope, $state, $location, $rootScope, $timeout, Session, AUTH_EVENTS ) {
        Session.destroy();

        this.credentials = { username: '', password: ''};

        var ctrl = this;
        this.login = function () {
            Parse.User.logIn( ctrl.credentials.username, ctrl.credentials.password )
                .then( function( user ) {
                    console.log('login');
                    Session.update();
                    console.log( 'success and update', Session);
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
