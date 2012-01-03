/* Pass in the module to which the default blacklist is to be attached.
 * Return a blacklist comprising all currently active whitelists for the module. 
 * Make these inactive in the new blacklist.
 */
var getBlacklistDefaults = function(module) {
	
	module = module;
	var whitelists = JSON.parse(localStorage.getItem("whitelists")),
	blacklists = [];
		
	for (whitelist in whitelists) {
		wl = whitelists[whitelist];
		if (!wl.inactive) {		
			blacklists.push (	
			{
				"blacklist" : wl.whitelist,
				"inactive" : true,
				"hits" : 0,
				"id" : wl.id
			});
		}
	}
	return blacklists ;
};