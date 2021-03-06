'use strict';

angular.module('crApp.startView', [ "ngRoute", "crLogger" ])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/startView', {
		templateUrl: 'startView/startView.html',
		controller: "StartViewCtrl"
	});
}])

.controller('StartViewCtrl', [ '$scope', '$rootScope', '$location', "connector", "loggerService", "chatInfo", 
function($scope, $rootScope, $location, connector, loggerService, chatInfo) {
	var logger = loggerService.getLogger("StartViewCtrl");
	logger.trace("Constructor");
	logger.info("startView isConnected: "+connector.isConnected());
	
	$("#chat_password").textinput();
	$("#join_popup").popup();
	$("#chat_password_join_entry").textinput();

	$scope.onStartButtonClick = function() {
		logger.info("clicked start button!");
		chatInfo.password = $("#chat_password").val();
		logger.info("chatInfo.password:",chatInfo.password);
		logger.info("$scope.chat_password:",$scope.chat_password);
		connector.startChat(function(resp) {
			logger.info("startChat received response: "+JSON.stringify(resp));
			if (resp) {
				logger.error("startChat error:",resp);
			}
		});		
	}

	$("#join_button").click(function() {
		logger.info("onJoinButtonClick");
		chatInfo.password = $("#chat_password_join_entry").val();
		logger.info("chatInfo.password:",chatInfo.password);
		$("#join_popup").popup("close");
		connector.joinChat(chatInfo.chatKey, function(resp) {
			if (resp) {
				logger.error("Join chat error:");
				logger.error(JSON.stringify(resp));
			}
		});		
	});

/*
	$scope.onJoinButtonClick = function() {
		logger.info("onJoinButtonClick");
		chatInfo.password = $("#chat_password_join_entry").val();
		logger.info("chatInfo.password:",chatInfo.password);
		$("#join_popup").popup("close");
		connector.joinChat(chatInfo.chatKey, function(resp) {
			if (resp) {
				logger.error("Join chat error:");
				logger.error(JSON.stringify(resp));
			}
		});		
	}
*/
	$scope.$on("serverResponse", function(event, resp) {
		if (resp.type === "userJoined") {
			logger.info("userJoined message received");	
			chatInfo.chatKey = resp.data.key;
			chatInfo.name = resp.data.name;
			logger.info("chatInfo: "+JSON.stringify(chatInfo));
			var hiddenUrl = window.location.href+"?key="+chatInfo.chatKey;
			logger.info("hiddenUrl: "+hiddenUrl);
			$("#hidden_input").val(hiddenUrl);
			logger.info("hidden_input val: "+$("#hidden_input").val());
			$location.path("/chatView");
			$scope.$apply();		
		}
	});

	try {
		var queryString = window.location.href.split("?");
		logger.info("queryString 1:",queryString);
		if (queryString.length > 1) {
			var newHref = queryString[0];
			queryString = queryString[1];
			logger.info("queryString 2:",queryString);
			queryString = queryString.split("=");
			logger.info("queryString 3:",queryString);
			var queryArgs = {};
			for (var i = 0; i < queryString.length; i += 2) {
				queryArgs[queryString[i]] = queryString[i+1];
			}
			if (queryArgs.key) {
				chatInfo.chatKey = queryArgs.key;
				$("#join_popup").popup("open");
				/*
				connector.joinChat(chatInfo.chatKey, function(resp) {
					if (resp) {
						logger.error("Join chat error:");
						logger.error(JSON.stringify(resp));
					}
				});
				*/							
			}
		}
	} catch(err) {
		logger.warn("Wrong querystring, err:",err);
	}

	//$("#start_view_div").css("margin-top", ($(window).height()-$("#start_view_div").outerHeight())/2);
}]);