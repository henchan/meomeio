/* Pass in the module to which the default blacklist is to be attached.
 * Return a blacklist comprising all currently active whitelists for the module. 
 * Make these inactive in the new blacklist.
 */
var getWhitelistDefaults = function(module) {
	
	module = module;
	var blacklists = JSON.parse(localStorage.getItem("blacklists")),
	whitelists = [];
		
	for (blacklist in blacklists) {
		wl = blacklists[blacklist];
		if (!wl.inactive) {		
			whitelists.push (	
			{
				"whitelist" : wl.blacklist,
				"inactive" : true,
				"hits" : 0,
				"id" : wl.id
			});
		}
	}
	return whitelists ;
};