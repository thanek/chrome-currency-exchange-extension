console.log('Hello from bg.js');

function sendSearch(amount, currency) {
    console.log('Calculating '+amount+' '+currency);
    var serviceCall = 'https://api.coinbase.com/v2/prices/'+currency+'-PLN/spot';

    var x = new XMLHttpRequest();
    x.open('GET', serviceCall);
    x.onload = function() {
	console.log(x.response);
	var d = JSON.parse(x.response);
	var exchange = d.data.amount*amount;
	var title = amount+' '+currency+' = '+exchange+' PLN';

        chrome.contextMenus.update('contextMenuId',{
            'title': title, 
            'enabled': true, 
            "contexts": ["all"],
            'onclick': function() {
            	alert('oki '+title);
            }
        });
    };
    x.send();
}

var currencies = [ {
	regex: /(\d*[\.,]?\d*)\s*([A-Z]{3})/,
	symbol: function(match) {
	    return match[1];
	},
	amount: function(match) {
	    return match[0];
	}
    },{
	regex: /(\d*[\.,]?\d*)\s*€/,
	symbol: function(match) {
	    return 'EUR';
	},
	amount: function(match) {
	    return match[1];
	}
    },{
	regex: /\$(\d*[\.,]?\d*)/,
	symbol: function(match) {
	    return 'USD';
	},
	amount: function(match) {
	    return match[1];
	}
    }
];

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.message == 'updateContextMenu') {
        if (request.selection != '') {
    	    for(const c of currencies) {
    		var match = c.regex.exec(request.selection);
    		if(match) {
    		    var amount = c.amount(match).replace(',','.');
    		    var currency = c.symbol(match);
    		    sendSearch(amount, currency);
    		    break;
    		}
    	    }
        } else {
            chrome.contextMenus.update('contextMenuId',{
                'title': 'No currency to calculate', 
                'enabled': false, 
                "contexts": ["all"]
            });
        }
    } else {
        sendResponse({});
    }
});

chrome.contextMenus.create({
    'id': 'contextMenuId', 
    'enabled': false, 
    'title': 'No currency to calculate', 
    "contexts": ["all"]
});
