angular.module('DrNEAR.services',['ngResource'])
    .constant( 'User', Parse.User )
    .constant( 'Activity', Parse.Object.extend("Activity") )
    .constant( 'Message', Parse.Object.extend("Message") )
    .constant( 'Disease', Parse.Object.extend("Disease") )
    .constant( 'FollowingUser', Parse.Object.extend("FollowingUser") )
    .constant( 'FollowingDisease', Parse.Object.extend("FollowingDisease") )
    .constant( 'FollowingActivity', Parse.Object.extend("FollowingActivity") )

    .factory( 'UserFactory', function( $timeout, FollowingUser, FollowingDisease, FollowingActivity ) {
        var UserObject = function( obj, opts ){
            if ( typeof(opts) !== 'object' ){
                opts = {};
            }

            var context = this;
            context.object          = obj;
            context.followings      = [];
            context.followers       = [];
            context.diseases        = [];
            context.blocked         = [];
            context.muted           = [];
            context.fightActivities  = [];
            context.load();
        };

        UserObject.prototype.fetchDiseases = function(opts){
            var followingDiseaseQuery = new Parse.Query(FollowingDisease);
            followingDiseaseQuery.equalTo("from", this.object);
            followingDiseaseQuery.include("to");
            return followingDiseaseQuery.find(opts);
        };

        UserObject.prototype.fetchFollowings = function(opts){
            var followingUserQuery = new Parse.Query(FollowingUser);
            followingUserQuery.equalTo("from", this.object);
            followingUserQuery.include("to");
            return followingUserQuery.find(opts);
        };

        UserObject.prototype.fetchFollowers = function(opts){
            var followerUserQuery = new Parse.Query(FollowingUser);
            followerUserQuery.equalTo("to",this.object);
            followerUserQuery.include("from");
            return followerUserQuery.find(opts);
        };

        UserObject.prototype.fetchFightActivities = function(opts){
            var followingActivityQuery = new Parse.Query(FollowingActivity);
            followingActivityQuery.equalTo("from",this.object);
            followingActivityQuery.include("to");
            followingActivityQuery.include("to.user");
            return followingActivityQuery.find(opts);
        };

        UserObject.prototype.save = function(){
            this.object.set( "username", this.username );
            this.object.set( "name", this.name );
            this.object.set( "bio", this.bio );
            this.object.set( "email", this.email );
            this.object.set( "role", this.role );
            if(this.iconurl) {
                //this.object.set( "icon", this.icon);
                this.object.set( "iconurl", this.iconurl);
            }
            return this.object.save();
        };

        UserObject.prototype.load = function(){
            console.log('Session.load');
            this.username      = this.object.get('username');
            this.name          = this.object.get('name') || this.object.get('username');
            this.icon          = this.object.get('icon');
            this.iconurl       = this.object.get('icon') ? this.object.get('icon') : 'img/material1.jpg';
            this.bio           = this.object.get('bio');
            this.email         = this.object.get('email');
            this.emailVerified = this.object.get('emailVerified');
            this.role          = this.object.get('role');

            var context = this;

            context.fetchDiseases().then( function(diseases){
                context.diseases = diseases;
                return context.fetchFollowings();
            }).then( function(followings){
                context.followings = followings;
                return context.fetchFollowers();
            }).then( function(followers){
                context.followers = followers;
                return context.fetchFightActivities();
            }).then( function(fightActivities){
                context.fightActivities = fightActivities;
            });
        };

        UserObject.prototype.isFollowing = function( target ) {
            if ( target.className == 'Disease' ) {
                return 0 < this.diseases.filter( function( item ){
                    return item.get('to').id == target.id;
                }).length;
            }
            else if ( target.className == 'User' ) {
                return 0 < this.followings.filter( function( item ){
                    return item.get('to').id == target.id;
                }).length;
            }
            else if ( target.className == 'Activity' ) {
                return 0 < this.fightActivities.filter( function( item ){
                    // test here that item is not undefined
                    return item.get('to').id == target.id;
                }).length;
            }
            return false;
        };

        UserObject.prototype.toggleFollowing = function( target ) {
            var context = this;
            if ( this.isFollowing( target ) ) {
                console.log( 'unfollow' );
                var q = new Parse.Query(
                    target.className == 'Disease' ? FollowingDisease : (target.className == 'User' ? FollowingUser :FollowingActivity)
                );
                q.equalTo( 'from', this.object );
                q.equalTo( 'to', target );
                return q.find().then(function(results){
                    for ( var i = 0; i < results.length; i++ ){
                        results[i].destroy();
                        context.removeFollowing( target, results[i] );
                        }
                });
            }
            else {
                console.log( 'follow' );
                var d = target.className == 'Disease' ? new FollowingDisease() 
                                                      : (target.className == 'User' ? new FollowingUser() : new FollowingActivity());
                d.set( 'from', this.object );
                d.set( 'to', target );
                return d.save().then(function(){
                        context.insertFollowing( target, d );
                });
            }
        }

        UserObject.prototype.insertFollowing = function( target, d ) {
            if ( target.className == 'Activity' ) {
                this.fightActivities.push(d);
            }
            else if ( target.className == 'Disease' ) {
                this.diseases.push(d);
            }
            else if ( target.className == 'User' ) {
                this.followings.push(d);
            }
        };

        UserObject.prototype.removeFollowing = function( target, item ) {
            if ( target.className == 'Activity' ) {
                for ( var i = 0; i < this.fightActivities.length; i++ ){
                    if(this.fightActivities[i].get('to').id == item.get("to").id
                    && this.fightActivities[i].get('from').id == item.get("from").id) {
                        this.fightActivities.splice(i, 1);
                    }
                }
            }
            else if( target.className == 'Disease' ) {
                for ( var i = 0;i < this.diseases.length; i++ ){
                    if(this.diseases[i].get('to').id == item.get("to").id
                    && this.diseases[i].get('from').id == item.get("from").id) {
                        this.diseases.splice(i, 1);
                    }
                }
            }
            else if( target.className == 'User' ) {
                for ( var i = 0;i < this.followings.length; i++ ){
                    if(this.followings[i].get('to').id == item.get("to").id
                    && this.followings[i].get('from').id == item.get("from").id) {
                        this.followings.splice(i, 1);
                    }
                }
            }
        };

        return {
        create : function( user, opts ) {
            return new UserObject( user, opts );
            }
        }; 
    })
 
    .service( 'Session', function( UserFactory, $timeout ){
        var service = {
            user            : undefined,
            activities      : [],
            isAuthenticated : false
         };

        service.update = function() {
            var currentUser = Parse.User.current();
            if ( currentUser ) {
                service.user = UserFactory.create( currentUser );
                service.isAuthenticated = true;
            }
        };

        service.destroy = function() {
            if ( service.user ) {
                Parse.User.logOut();
                service.user = undefined;
                service.isAuthenticated = false;
            }
        };

        service.isAuthorized = function (authorizedRoles) {
            if (!angular.isArray(authorizedRoles)) {
                authorizedRoles = [authorizedRoles];
            }
            // return service.enable && (authorizedRoles.indexOf(Session.role) !== -1);
            return service.isAuthenticated;
        };

        // service.update();
        return service;
    })

    .constant('AUTH_EVENTS', {
        loginSuccess     : 'auth-login-success',
        loginFailed      : 'auth-login-failed',
        logoutSuccess    : 'auth-logout-success',
        sessionTimeout   : 'auth-session-timeout',
        notAuthenticated : 'auth-not-authenticated',
        notAuthorized    : 'auth-not-authorized'
    })

    .constant('USER_ROLES', {
        all    : '*',
        admin  : 'admin',
        editor : 'editor',
        guest  : 'guest'
    })

    .directive('formAutofillFix', function ($timeout) {
        console.log( 'formAutofillFix' );
        return function (scope, element, attrs) {
            element.prop('method', 'post');
            if (attrs.ngSubmit) {
                $timeout(function () {
                    element
                        .unbind('submit')
                        .bind('submit', function (event) {
                            event.preventDefault();
                            element
                                .find('input, textarea, select')
                                .trigger('input')
                                .trigger('change')
                                .trigger('keydown');
                            scope.$apply(attrs.ngSubmit);
                        });
                });
            }
        };
    })
    .service('Profile', function(Activity, UserFactory, $timeout) {
        var service = {
            user            : undefined,
            activities      : [],
            diseases        : []
        };

        service.update = function(user) {
            return new Promise(function(resolve) {
                service.activities = [];
                service.user = UserFactory.create( user );


                var query = new Parse.Query( Activity );
                query.limit( 10 );
                query.descending( 'createdAt' );
                query.equalTo( 'user', user );
                query.include( 'user' );
                query.find().then(
                    function( activities ) {
                        $timeout( function(){
                            service.activities = activities;

                            var CommentObject = Parse.Object.extend("CommentObject");
                            var query = new Parse.Query( CommentObject );

                            query.containedIn("commentTo",activities.map(function(item) {
                                return item.id;
                            }));
                            query.descending( 'createdAt');
                            query.find({
                                success: function( replies ){
                                    activities.forEach(function(activity){
                                        activity.comments = replies.filter(function(comment,index){
                                            if (comment.get('commentTo') == activity.id) return true;
                                        });
                                    })                                  
                                }
                            })
                            resolve(service);
                        });
                    }
                );
            });
        };

        return service;

    })

    .directive("match", ["$parse", function($parse) {
       return {
        require: 'ngModel',
        link: function(scope, elem, attrs, ctrl) {
          scope.$watch(function() {
            var target = $parse(attrs.match)(scope);  // 比較対象となるモデルの値
            return !ctrl.$modelValue || target.$modelValue === ctrl.$modelValue;
          }, function(currentValue) {
            ctrl.$setValidity('mismatch', currentValue);
          });
        }
      }
    }
    ])

    .directive('autolinker', ['$timeout',
      function($timeout) {
        return {
          restrict: 'A',
          link: function(scope, element, attrs) {
            $timeout(function() {
              var eleHtml = element.html();

              if (eleHtml === '') {
                return false;
              }

              var text = Autolinker.link(eleHtml, {
                className: 'autolinker',
                newWindow: false
              });

              element.html(text);

              var autolinks = element[0].getElementsByClassName('autolinker');

              for (var i = 0; i < autolinks.length; i++) {
                angular.element(autolinks[i]).bind('click', function(e) {
                  var href = e.target.href;
                  console.log('autolinkClick, href: ' + href);

                  if (href) {
                    //window.open(href, '_system');
                    window.open(href, '_blank');
                  }

                  e.preventDefault();
                  return false;
                });
              }
            }, 0);
          }
        }
      }
    ])

    .filter('nl2br', ['$filter',
      function($filter) {
        return function(data) {
          if (!data) return data;
          return data.replace(/\n\r?/g, '<br />');
        };
      }
    ])
