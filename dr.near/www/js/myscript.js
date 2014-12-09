var module = angular.module( 'Myapp', [] );
module.controller( 'MyController', ['$scope',
function($scope){
	$scope.users = [
		{"name":"Nakagawa Shintaro","diseases":"Distal Myopathy","medicine":"medicine1"},
	];
	$scope.diseases = [ 
		{ name: 'Distal Myopathy', medicines: [ { name: 'medicine1', users: [ { name: 'userA' }, { name: 'userB' }, { name: 'userC'} ] },
												{ name: 'medicine2', users: [ { name: 'userD' }, { name: 'userE' } ] },
												{ name: 'medicine3', users: [ { name: 'userF' } ] },
												{ name: 'medicine4', users: [ { name: 'userG' } ] },
												{ name: 'medicine5', users: [ { name: 'userH' } ] } ] },

		{ name: 'Hand-Schuller-Christain disease', medicines: [ { name: 'medicine6', users: [ { name: 'userI' } ] } ]  },

		{ name: 'muscular dystrophy', medicines:[ { name: 'medicine7', users: [ { name: 'userJ' } ] },
												  { name: 'medicine8', users: [ { name: 'userK' } ] },
												  { name: 'medicine9', users: [ { name: 'userL' } ] } ] },
		 ]

		} ] );


