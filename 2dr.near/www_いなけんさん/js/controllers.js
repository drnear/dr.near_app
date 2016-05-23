angular.module('DrNEAR.controllers', ['ngCordova','DrNEAR.services'])
    .controller( 'AppCtrl', function(
        $timeout, $scope, $state, Session
    ){
        var appctrl = this;
        appctrl.session = Session;

        $scope.doneLoading = false;

        appctrl.logout = function(){
            Parse.User.logOut().then(() => {
              var currentUser = Parse.User.current();  // this will now be null
            });
            $state.go( 'login' );
        }
    })

    .controller( 'ActivityCtrl', function(
        $scope, $state, $stateParams, $rootScope, $location, $timeout, Profile, Session, Activity, FollowingDisease, FollowingActivity
    ) {
        this.items = [];
        var ctrl = this;
        Session.update();

        Session.user.fetchFollowings().then(function(followings){
            Session.user.fetchDiseases().then( function(diseases){
                Session.user.fetchFightActivities().then( function(fightActivities){;

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
                                    $scope.doneLoading = true;
                                    ctrl.items = results;

                                    if ( Session.user.diseases.length == 0 ){
                                        $state.go('intro');
                                    }

                                    var CommentObject = Parse.Object.extend("CommentObject");
                                    var query = new Parse.Query( CommentObject );

                                    query.containedIn("commentTo",ctrl.items.map(function(item) {
                                        return item.id;
                                    }));
                                    query.descending( 'createdAt');
                                    query.find({
                                        success: function( replies ){


                                            var fightActivityQuery = new Parse.Query( FollowingActivity );

                                            fightActivityQuery.containedIn('to',ctrl.items);

                                            fightActivityQuery.descending( 'createdAt');
                                            fightActivityQuery.find({
                                                success: function( fightTo ){
                                                    ctrl.items.forEach(function(activity){
                                                        activity.fightActivities = fightTo.filter(function(fight, index){
                                                            if (fight.get("to").id == activity.id) return true;
                                                        }).map(function(followingActivity) {
                                                            return followingActivity.get('from').id;
                                                        });
                                                    });
                                                    $scope.$apply();
                                                }
                                            });


                                            ctrl.items.forEach(function(activity){
                                                activity.comments = replies.filter(function(comment,index){
                                                    if (comment.get('commentTo') == activity.id) return true;
                                                }); 
                                            })
                                            $scope.$apply();
                                        }
                                    })
                                });
                            },
                            function( err ) {
                                console.log( 'err', err );
                            }
                        );
                    });
                });
            });
        });
        ctrl.toProfile = function( item ) {
            Profile.update(item.get('user')).then(function(profile) {
                $state.go('app.toProfile');
            });
        };
        ctrl.toggleComment = function( item ) {
            item.showReply = !item.showReply;
        }
        
        ctrl.toggleFight = function(item){
            Session.user.toggleFollowing( item ).then(function(saved){
                ctrl.toggleFightInner(item);
                console.log('toggleFollowing');
                $scope.$apply();
            });
        }
        ctrl.toggleFightInner = function(item) {
            for(var i = 0; i < item.fightActivities.length; i++) {
                if(item.fightActivities[i] == Session.user.object.id) {
                    item.fightActivities.splice(i, 1);
                    return;
                }
            }
            item.fightActivities.push(Session.user.object.id);
        };
        ctrl.isFight = function( item ){
            return Session.user.isFollowing( item );
            console.log('isLike');
        };
        ctrl.reply = function( item ){
            console.log( 'comment' );
            var CommentObject = Parse.Object.extend( 'CommentObject' );
            var comment = new CommentObject();
            var user = Session.user.object;

            comment.set( 'commentTo', item.id);
            comment.set( 'content', item.commentContent);
            comment.set( 'iconurl', user.get('iconurl') );
            comment.set( 'user', user );

            comment.save().then(function(){
                item.commentContent = '';
                item.comments.unshift(comment);
                $scope.$apply();
            });
        }
    })
    .controller( 'ActivityPostCtrl', function( $state, Activity, Session ){
        var ctrl =　this;
        ctrl.view = 'feedback';
        console.log(ctrl.view);

        ctrl.post = function(entry){
            var Activity = Parse.Object.extend( 'Activity' );
            var activity = new Activity();
            var user = Session.user.object;

            activity.set( 'user', user );
            activity.set( 'role', user.get('role') );
            activity.set( 'title', ctrl.entry.title );
            activity.set( 'content', ctrl.entry.content );

            activity.save().then( function(){
                $state.go('app.activity');
            })
        }

    })

    .controller( 'AlertCtrl', function(
        $scope, $stateParams, $timeout
    ) {
        console.log( 'AlertCtrl' );
    })

    .controller( 'SearchCtrl', function( $scope, $timeout, FollowingUser, FollowingDisease, Session ) {
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

        ctrl.toggleSearch = function( target ){
            Session.user.toggleFollowing( target ).then(function(saved){
                console.log('toggleSearch');
                $scope.$apply();
            });
        }
        ctrl.isSelectDisease = function( target ){
            return Session.user.isFollowing( target );
            console.log('isSelectDisease');
        };
    })


    .controller( 'toProfileCtrl', function( $scope, Profile, Session ) {
        console.log( 'toProfileCtrl' );

        var ctrl = this;
        ctrl.view = 'activity';
        ctrl.user = Profile.user;
        ctrl.other = (ctrl.user.username != Session.user.username);
        //$scope.$apply(function () {
        ctrl.activities = Profile.activities;
        //});

        ctrl.toProfile = function( item ) {
            Profile.update(item.get('user')).then(function(profile) {
                $state.go('app.toProfile');
            });
        };
        ctrl.toggleComment = function( item ) {
            console.log( 'comment' );
            console.log( item.id );
            item.showReply = !item.showReply;
        }      
        ctrl.toggleFight = function(item){
            Session.user.toggleFollowing( item ).then(function(saved){
                console.log('toggleFollowing');
                $scope.$apply();
            });
        }
        ctrl.isFight = function( item ){
            return Session.user.isFollowing( item );
            console.log('isLike');
        };
        ctrl.reply = function( item ){
            console.log( 'comment' );
            var CommentObject = Parse.Object.extend( 'CommentObject' );
            var comment = new CommentObject();
            var user = Session.user.object;

            comment.set( 'commentTo', item.id);
            comment.set( 'iconurl', user.get('iconurl') );
            comment.set( 'content', item.commentContent);
            comment.set( 'user', user );

            comment.save().then(function(){
                item.commentContent = '';
                item.comments.unshift(comment);
                $scope.$apply();
            });
        }
    })
    .controller( 'ProfileCtrl', function( $scope, $state, $timeout, Profile, Session, Activity, FollowingActivity ) {
        console.log( 'ProfileCtrl' );

        var ctrl = this;
        ctrl.view = 'activity';
        ctrl.user = Session.user;
        //$scope.$apply(function () {
            //ctrl.activities = Session.activities;
        //});
        var myPostQuery = new Parse.Query( Activity );
        myPostQuery.equalTo( "user" , ctrl.user.object );
  
        myPostQuery.descending( "createdAt" );
        myPostQuery.find({
            success: function( replises ) {
                $timeout( function(){
                    ctrl.activities = replises;

                    var CommentObject = Parse.Object.extend("CommentObject");
                    var query = new Parse.Query( CommentObject );

                    query.containedIn("commentTo",ctrl.activities.map(function(item){
                        return item.id
                    }));
                    query.descending( 'createdAt' );
                    query.find({
                        success: function ( replies ){
                            var fightActivityQuery = new Parse.Query( FollowingActivity );

                            fightActivityQuery.containedIn('to',ctrl.activities);
                            fightActivityQuery.descending( 'createdAt');
                            fightActivityQuery.find({
                                success: function( fightTo ){
                                    ctrl.activities.forEach(function(activity){
                                        activity.fightActivities = fightTo.filter( function  (fight, index) {
                                            if (fight.get("to").id == activity.id) return true;
                                        }).map(function(followingActivity) {
                                            return followingActivity.get('from').id;
                                        })
                                    });
                                    $scope.$apply();
                                }
                            });

                            ctrl.activities.forEach(function(activity){
                                activity.comments = replies.filter(function(comment,index){
                                    if (comment.get('commentTo') == activity.id) return true;
                                }); 
                            })
                            $scope.$apply();
                        }
                    })
                })
            }
        });

        ctrl.toProfile = function( ) {
            $state.go('app.activity');
        };
        ctrl.toggleComment = function( item ) {
            console.log( 'comment' );
            console.log( item.id );
            item.showReply = !item.showReply;
        }      
        ctrl.toggleFight = function(item){
            Session.user.toggleFollowing( item ).then(function(saved){
                console.log('toggleFollowing');
                $scope.$apply();
            });
        }
        ctrl.isFight = function( item ){
            return Session.user.isFollowing( item );
            console.log('isLike');
        };
        ctrl.reply = function( item ){
            console.log( 'comment' );
            var CommentObject = Parse.Object.extend( 'CommentObject' );
            var comment = new CommentObject();
            var user = Session.user.object;

            comment.set( 'commentTo', item.id);
            comment.set( 'iconurl', user.get('iconurl') );
            comment.set( 'content', item.commentContent);
            comment.set( 'user', user );

            comment.save().then(function(){
                item.commentContent = '';
                item.comments.unshift(comment);
                $scope.$apply();
            });
        }
    })

    .controller('ProfEditCtrl', function( $state, $cordovaCamera, $timeout, Session ) {
        var ctrl = this;
        ctrl.session = Session;

        ctrl.useCamera = function() {
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

        ctrl.selectIcon = function() {
            document.getElementById('icon-handler').click();
        };

        ctrl.uploadIcon = function( iconElem ) {
            if ( iconElem.files[0] ) {
                var reader = new FileReader();
                reader.onload = function(ev){
                    document.getElementById('icon-image').src = ev.target.result;
                };
                reader.readAsDataURL( iconElem.files[0] );
                Session.user.file = iconElem.files[0];
            }
        };

        ctrl.update = function() {
            // 2/14 start
            if(Session.user.file) {
                var newFile = new Parse.File(Session.user.file.name, Session.user.file);
                newFile.save({
                    success: function() {
                    },
                    error: function(file, err) {
                        console.log("File save error: "+ file.message);
                    }
                }).then(function(theFile) {
                    Session.user.icon = theFile;
                    Session.user.iconurl = theFile.url();
                    Session.user.save().then(function(saved){
                        $timeout(function(){
                            $state.go( 'app.profile' );
                        });
                    },function(err){
                        console.log(err);
                    });
                });
            } else {
            // 2/14 end
                Session.user.save().then(function(saved){
                    $timeout(function(){
                        $state.go( 'app.profile' );
                    });
                },function(err){
                    console.log(err);
                });
            }
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

    .controller( 'MessageListCtrl', function( Session, Message, Profile, $timeout, $state ) {
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

        ctrl.openThread = function( item ) {
            Profile.update(item.user).then(function(profile) {
               $state.go( 'app.message_thread', { uid: item.user.id } );
            });
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
    .controller('MessageThreadCtrl', function( 
        Session, User, Message, Profile, $scope, $rootScope, $state, $stateParams,
        $ionicActionSheet, $ionicPopup, $ionicScrollDelegate, $timeout, $interval ) {
        var ctrl = this;

        ctrl.messages = [];
        ctrl.user = Session.user; 

        var getUserQuery = new Parse.Query( User );
        var toUser = Profile.user.object; 
        var messageCheckTimer;
        var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');
        var footerBar;
        var scroller;
        var txtInput; 

        $scope.$on('$ionicView.enter', function() {

          getUserQuery.get();
          
          $timeout(function() {
            footerBar = document.body.querySelector('#userMessagesView .bar-footer');
            scroller = document.body.querySelector('#userMessagesView .scroll-content');
            txtInput = angular.element(footerBar.querySelector('textarea'));
          }, 0);

          messageCheckTimer = $interval(function() {
            // here you could check for new messages if your app doesn't use push notifications or user disabled them
          }, 20000);
        });

        $scope.$on('$ionicView.leave', function() {
          console.log('leaving UserMessages view, destroying interval');
          // Make sure that the interval is destroyed
          if (angular.isDefined(messageCheckTimer)) {
            $interval.cancel(messageCheckTimer);
            messageCheckTimer = undefined;
          }
        });

        $scope.$on('$ionicView.beforeLeave', function() {
          if (!ctrl.messageField || ctrl.messageField === '') {
            localStorage.removeItem('userMessage-' + ctrl.user.id);
          }
        });

        getUserQuery.get( $stateParams.uid, {
            success: function( user ){
                $scope.doneLoading = true;

                var messageFromUser = new Parse.Query( Message );
                messageFromUser.equalTo( "from", toUser );
                messageFromUser.equalTo( "to", Session.user.object );

                var messageToUser = new Parse.Query( Message );
                messageToUser.equalTo( "from", Session.user.object );
                messageToUser.equalTo( "to", toUser );

                var query = Parse.Query.or( messageFromUser, messageToUser );
                query.include( "from", "to" );
                query.limit( 50 );
                //query.descending( "createdAt" );
                query.ascending( "createdAt" );// inaken
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

        $scope.$watch('ctrl.sendMessageForm.messageField', function(newValue, oldValue) {
            console.log('ctrl.sendMessageForm.messageField $watch, newValue ' + newValue);
            if (!newValue) newValue = '';
            localStorage['userMessage-' + ctrl.user.id] = newValue;
        });

        ctrl.sendMessage　= function( sendMesssgeForm ) {
            console.log('sendMessage');
            keepKeyboardOpen();

            console.log('sendMessage');
            var Message = Parse.Object.extend( 'Message' ); 
            var msg = new Message();
            var user =  Session.user.object
            var toUser = Profile.user.object;

            msg.set( 'from', user );
            msg.set( 'to', toUser );
            msg.set( 'content', ctrl.messageField );

            msg.save().then( function(){
                ctrl.messages.push( msg );
                ctrl.messageField = '';
                $scope.$apply();
            })
            $timeout(function() {
                keepKeyboardOpen();
                viewScroll.scrollBottom(true);
            }, 0);

            $timeout(function() {
                ctrl.messages.push();
                keepKeyboardOpen();
                viewScroll.scrollBottom(true);
            }, 2000);
        }
        function keepKeyboardOpen() {
          console.log('keepKeyboardOpen');
          txtInput.one('blur', function() {
            console.log('textarea blur, focus back on it');
            txtInput[0].focus();
          });
        }

        $scope.onMessageHold = function(e, itemIndex, message) {
          console.log('onMessageHold');
          console.log('message: ' + JSON.stringify(message, null, 2));
          $ionicActionSheet.show({
            buttons: [{
              text: 'Copy Text'
            }, {
              text: 'Delete Message'
            }],
            buttonClicked: function(index) {
              switch (index) {
                case 0: // Copy Text
                  //cordova.plugins.clipboard.copy(message.text);

                  break;
                case 1: // Delete
                  // no server side secrets here :~)
                  $scope.messages.splice(itemIndex, 1);
                  $timeout(function() {
                    viewScroll.resize();
                  }, 0);

                  break;
              }
              
              return true;
            }
          });
        }
        
        $scope.$on('taResize', function(e, ta) {
          console.log('taResize');
          if (!ta) return;
          
          var taHeight = ta[0].offsetHeight;
          console.log('taHeight: ' + taHeight);
          
          if (!footerBar) return;
          
          var newFooterHeight = taHeight + 10;
          newFooterHeight = (newFooterHeight > 44) ? newFooterHeight : 44;
          
          footerBar.style.height = newFooterHeight + 'px';
          scroller.style.bottom = newFooterHeight + 'px'; 
        });

    })

    .controller( 'ResetPasswordCtrl', function() {
        var ctrl = this;
        ctrl.credentials = { mail: ''};

        ctrl.reset = function( credentials ){
            Parse.User.requestPasswordReset(ctrl.credentials.mail,{
                success: function(){

                },
                error: function( error ){
                    alert("Error:" + error.code );
                }
            })


        }
    })

    .controller( 'SignupCtrl', function( $scope, $timeout, $state,$rootScope, $cordovaFacebook, AUTH_EVENTS, Session) {
        Session.destroy();
        console.log( Session ); 
        this.credentials = {username: '', email:'', password:''};

        var ctrl = this;
        ctrl.signup = function(credentials) {
            console.log( 'signup' );
            var user = new Parse.User();
            indexUsername = ctrl.credentials.email.indexOf("@");
            var username = ctrl.credentials.email.substr(0,indexUsername);

            user.set( 'username', username );
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

        ctrl.backTo = function(){
            $state.go('login');
        }

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

    .controller( 'LoginCtrl', function( $scope, $state, $rootScope, $timeout, $ionicPopup, User, Session, AUTH_EVENTS ) {

        this.credentials = { email: '', password: ''};
        var ctrl = this;

        ctrl.signup = function() {
            $state.go( 'signup' );
        };
        ctrl.login = function (credentials) {
            var queryEmail = new Parse.Query( User );
            queryEmail.equalTo( "email", ctrl.credentials.email );
            queryEmail.find().then(
                function( Users ) {
                    if (typeof Users[0] === "undefined") {
                        ctrl.credentials.error = true;
                        $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                        $ionicPopup.alert({
                            title: 'Login failed',
                            template: 'Please check e-mail'
                        });
                    }   else
                        {                        
                            console.log(Users);
                            var loginUsername = Users[0].get('username');
                            Parse.User.logIn( loginUsername, ctrl.credentials.password )
                                .then( function( user ) {
                                    console.log('login');
                                    Session.update();
                                    console.log( 'success and update', Session);
                                    $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                                }, function(err) {
                                    $ionicPopup.alert({
                                        title: 'Login failed',
                                        template: 'Please check e-mail and password'
                                    });
                                    ctrl.showAlert = err.message;
                                    ctrl.credentials.error = true;
                                    $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                                });
                        }
                }
            )
        };
        $scope.$watch('ctrl.credentials.username', function() {
            ctrl.credentials.error = false; 
        });
        $scope.$watch('ctrl.credentials.password', function() {
            ctrl.credentials.error = false; 
        });
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
        ctrl.resetpassword = function() {
            $state.go( 'resetpassword' );
        }
        ctrl.showAlert = function (){
            $ionicPopup.alert({
              title: 'Success',
              content: 'Hello World!!!'
            })
        };
    })

    .controller( 'IntroCtrl',function($scope, $state, $stateParams, $ionicSlideBoxDelegate,
                                      $ionicModal, $timeout, $location, Session){
        var ctrl = this;
        ctrl.view = 'patient';
        ctrl.session = Session;
        ctrl.searchWord = '';
        ctrl.diseases   = [];
        ctrl.timer = undefined;

        console.log( 'IntroCtrl' );

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
        ctrl.changeRole = function() {
          console.log($scope.ctrl.session.user.role); //-> 選択されたアイテムの値
        }
        ctrl.update = function() {
            Session.user.save().then(function(saved){
                $timeout(function(){
                    $state.go( 'app.first' );
                });
            },function(err){
                console.log(err);
            });
        };

        $scope.changeItem = function() {
          console.log($scope.selectedItem);  //-> 選択されたアイテムの値
        }

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
    })
    .controller( 'FirstCtrl',function($scope, $state, $stateParams, $timeout, $location, Session, Activity){
//SearchCtrl
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
                    ctrl.diseases.splice(0);
                });
                return;
            }

            ctrl.timer = $timeout(function(){
                var diseaseQuery = new Parse.Query(Parse.Object.extend("Disease"));
                diseaseQuery.matches( "name", new RegExp(".*" + ctrl.searchWord + ".*",'i') );
                diseaseQuery.find().then(function(diseases){
                    $timeout(function(){
                        ctrl.diseases = diseases;
                    });
                });
            },500);
        };
        ctrl.toggleSearch = function( target ){
            Session.user.toggleFollowing( target ).then(function(saved){
                ctrl.searchWord = target.get('name');
                console.log('toggleSearch');
                $scope.$apply();
            });
        }
        ctrl.isSelectDisease = function( target ){
            return Session.user.isFollowing( target );
            console.log('isSelectDisease');
        };
        ctrl.create = function( target ) {
            ctrl.diseasetag = true;
            var Disease = Parse.Object.extend("Disease");
            var diseaseQuery = new Parse.Query(Disease);
            var disease = new Disease();
            var user = Session.user.object;
            diseaseQuery.equalTo("name",ctrl.searchWord);
            diseaseQuery.first().then(function(res){
                if ( res ) {
                    console.log( 'first', res );
                    // ctrl.select( res);
                }
                else {
                    disease.set( 'user', user );
                    disease.set( "name", ctrl.searchWord );
                    disease.save().then(function(obj){
                        ctrl.toggleSearch( obj );
                    });
                }

            }, function(err){
                    disease.set( 'user', user );
                    disease.set( "name", ctrl.searchWord );
                disease.save().then(function(obj){
                    ctrl.toggleSearch( target );
                });
            });
        };
        ctrl.post = function(entry){
            var Activity = Parse.Object.extend( 'Activity' );
            var activity = new Activity();
            var user = Session.user.object;

            activity.set( 'user', user );
            activity.set( 'role', user.get('role') );
            activity.set( 'title', "Welcoming people." );
            activity.set( 'content', ctrl.entry.content );

            activity.save().then( function(){
                $state.go('app.activity');
            })
        }
    });