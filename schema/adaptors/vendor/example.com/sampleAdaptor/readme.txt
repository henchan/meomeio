Developers of third-party adaptors may add their own adaptors alongside those from meo.my.

1. Create a new directory under /modules/vendor. Named to your organisation's domain name space.
2. In your name space, create a new directory. One for each adaptor. Free naming but it must conform to directory naming requirements for all OS supported by Chrome.
3. Put all your adaptor's code into its directory.
4. Create adaptor.json with details of your organisation and your adaptor as well as the function code you wish to execute in the content script scope
5. Optionally include code for an admin form
6. Add your adaptor's namespace/name to the admin page for modules. 

The following constraints apply to all adaptors :
- Adaptors have the context of the web page being browsed (see Chrome Extension (crx) Content Scripts)
- To introduce your adaptor's custom code into this context, extend the adaptor object
- Adaptors run in the background, having the context of the web page being browsed (see Chrome Extension (crx) Content Scripts)
- A white list of matching Web sites is configured for all adaptors. Each adaptor also has its own separate white list which is incremental to the master.
- Logging is turned on/off for all adaptors, not individually
- Adaptor configurations are per browser. They are not synched across a user's various machines.
- Resetting all modules to defaults restores the standard adaptors in defaults.js file. Hits counters are reset to zero. Deletes do not cascade, so old adaptor configurations are preserved.
- Resetting an adaptor to defaults restores the settings in the adaptor's defaults.js file. Hits counters are reset to zero.
- Adaptors do not query the database. They request background to request crx to put data into it.
- The meo.my crx handles database connectivity. Therefore, it must be enabled in the browser and logged in to the user's Culture for adaptors to save data.

 adaptor.js
	Adaptor-specific custom code which runs in the scope of the browser page. Has full access to the page's DOM. JQuery calls may be used.
	Your adaptor codes filters and uses the success callback to send the specified dataObj object back to the modules extension  
	The adaptor's initialize function will be called from the extension's content script. 
	Results should be returned using two callbacks (options.success and options.error). 
	 Customise the namespace, name, description, version, updates values
	 Do not alter the :
	 	- file name: 'adaptor.js'
	 	- 'initialize' function name
	 	- options argument to initialize function
	 	- object structure of returned data: {tagHits, contentArr}
		- object structure of input data:
			options.error (function)
			options.success (function)
			options.parameters (object array)


	options.parameters is an array of objects containing custom data, typically entered optionally by the user in an admin form which may have been supplied by you as part of your adaptor's package. 
	Available attributes of options.parameters : [{<key> : {contents, inactive, separator, hits} }, ... ]
		