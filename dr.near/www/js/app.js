// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('Myapp', ['ionic'])
.run( function(){
    Parse.initialize("9gKD3uVKGnAYKcQqFMpTjSqRFkYgnzZWrK9XRBic", "sNgRKL57Gc2BI1resCzLQjM0mpymjq663Xu93o1e");
})
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // Set the statusbar to use the default style, tweak this to
      // remove the status bar on iOS or change it to use white instead of dark colors.
      StatusBar.styleDefault();
    }
  });
})
.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('login1', {
            url: '/login',
            templateUrl: 'login1.html'
        })
        .state('signup1', {
            url: '/signup',
            templateUrl: 'signup1.html'
        })
        .state('messages1', {
            url: '/messages',
            templateUrl: 'messages1.html'
        })
        .state('amessage1', {
            url: '/amessage/:uid',
            templateUrl: 'amessage1.html'
        })
        .state('disease1', {
            url: '/disease',
            templateUrl: 'disease1.html'
        })
        .state('medicine1', {
            url: '/medicine',
            templateUrl: 'medicine1.html'
        })
        .state('page16', {
            url: '/page16',
            templateUrl: 'page16.html'
          })
        .state('home', {
            url: '/home',
            templateUrl: 'home.html'
        });
        // if none of the above states are matched, use this as the fallback
      $urlRouterProvider.otherwise('/messages');
})
.run( function(){
    var UserObject = Parse.Object.extend( 'User2' );

    var user0 = new UserObject();
    user0.set( 'name', 'user0' );
    user0.save();

    var user1 = new UserObject();
    user1.set( 'name', 'user1' );
    user1.save();

    var user2 = new UserObject();
    user2.set( 'name', 'user2' );
    user2.save();

    var user3 = new UserObject();
    user3.set( 'name', 'user3' );
    user3.save();

    var user4 = new UserObject();
    user4.set( 'name', 'user4' );
    user4.save();

    var MessageObject = Parse.Object.extend( 'Message2' );
    var message0 = new MessageObject();
    message0.save({
      'from': user0,
      'to': user1,
      'content':"I'm gonna be there."
    })
    var message4 = new MessageObject();
    message4.save({
      'from': user0,
      'to': user1,
      'content':"I'm gonna be my love."
    })
    var message1 = new MessageObject();
    message1.save({
      'from': user4,
      'to': user0,
      'content':'I love the healthy food.'
    })
    var message2 = new MessageObject();
    message2.save({
      'from': user3,
      'to': user0,
      'content':'I love myself.'
    })
    var message3 = new MessageObject();
    message3.save({
      'from': user0,
      'to': user2,
      'content':'Hey,Jude'
    })
    var message5 = new MessageObject();
    message5.save({
      'from': user0,
      'to': user2,
      'content':'Hey,Jack'
    })
     var message6 = new MessageObject();
    message6.save({
      'from': user2,
      'to': user0,
      'content':"Let's get it on"
    })
})
.controller( 'MainController', ['$scope',
        function($scope){
            $scope.users = [
            { 
              name : "Nakagawa Shintaro", 
              position : "patient",
              diseases : "Hand-Schuller-Christain", 
              medicine :"Grivec"},
            ];
            $scope.timelines = [
            { 
              title: "medicine", 
              comment:"I'm not much better,and there is a little hope of recovery",
              userphoto :"user photo"}
            ];
            
            $scope.diseases = [ 
            { 
              name: 'Distal Myopathy', 
              medicines: [ 
                { name: 'medicine1', 
                  users: [ 
                    { name: 'userA' }, 
                    { name: 'userB' }, 
                    { name: 'userC'} 
                  ] 
                },
                { name: 'medicine2', 
                  users: [ 
                    { name: 'userD' }, 
                    { name: 'userE' } 
                  ] 
                },
                { name: 'medicine3', 
                  users: [ { name: 'userF' } 
                  ] 
                },
                { name: 'medicine4',
                  users: [ { name: 'userG' } 
                  ] 
                },
                { name: 'medicine5', 
                  users: [ { name: 'userH' } 
                  ] 
                } 
              ] 
            },

            { 
              name: 'Hand-Schuller-Christain disease', 
              medicines: [ 
                { name: 'medicine6', 
                  users: [ 
                    { name: 'userI' } 
                  ] 
                } 
              ]  
            },

            { name: 'muscular dystrophy',
              medicines:[ 
                { name: 'medicine7', 
                  users: [ 
                    { name: 'userJ' }
                  ] 
                },
                { name: 'medicine8', 
                  users: [ { name: 'userK' } 
                  ] 
                },
                { name: 'medicine9', 
                  users: [ { name: 'userL' } 
                  ] 
                } 
              ] 
            },
           ];
        } ] )
.controller( 'MessagesController', [ '$scope', '$location', 'LoginUser', function( $scope, $location, LoginUser ) {
        $scope.loginUser;
        $scope.messages  = [];

        LoginUser.then( function( user ) {
            $scope.loginUser = user;

            var MessageObject = Parse.Object.extend( 'Message2' );

            var queryFrom = new Parse.Query( MessageObject );
            queryFrom.equalTo( 'from', $scope.loginUser );
            var queryTo = new Parse.Query( MessageObject );
            queryTo.equalTo( 'to', $scope.loginUser );

            var query = Parse.Query.or( queryFrom, queryTo );
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
        $scope.detail = function( msg ) {
            var user = (msg.type == 'sent') ? msg.object.get('to') : msg.object.get('from');
            $location.path( '/amessage/' + user.id );
        };
    }])           
.controller('AmessageController', [ '$scope', '$location', '$routeParams', 'LoginUser', function( $scope, $location, $routeParams, LoginUser ) {
        $scope.loginUser;
        $scope.messages = [];

        LoginUser.then( function( user ) {
            $scope.loginUser  = user;

            var MessageObject = Parse.Object.extend( 'Message2' );
            var UserObject = Parse.Object.extend( 'User2' );

            var targetUser = new UserObject();
            targetUser.id = $routeParams.uid; // 特定のユーザーとのやりとりを検索

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
.controller( 'DiseaseController', ['$scope',
        function($scope){
            $scope.diseases = [
            { 
              name : "Distal Myopathy", 
              medicine : "MIDAZOLAM,",
              photo : "Userphoto", },
            ];
        } ] )
.controller( 'MedicineController', ['$scope',
        function($scope){
            $scope.medicines = [
            { 
              company : "Novartis Pharma", 
              medicine : "Glivec", },
            ];
        }])
.factory( 'LoginUser', function() {
  // ログインユーザーは仮に「最初のユーザー」とする
    var UserObject = Parse.Object.extend( 'User2' );
    var query = new Parse.Query( UserObject );
    query.limit(1);
    query.ascending( 'createdAt' );
    return query.first().then( function( result ) 
      { return result.fetch();  } );
})