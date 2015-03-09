angular.module('Myapp.services',['ngResource'])	

	.factory( 'LoginUser', function() {
	  // ログインユーザーは仮に「最初のユーザー」とする
	    var UserObject = Parse.Object.extend( 'User2' );
	    var query = new Parse.Query( UserObject );
	    query.limit(1);
	    query.ascending( 'createdAt' );
	    return query.first().then( function( result ) 
	      { return result.fetch();  } );
	})
	.factory('Session', function ($resource) {
    return $resource('http://localhost:5000/sessions/:sessionId');
	});