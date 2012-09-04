
function showLoading() {}
function hideLoading() {}

var Storekit = require('ti.storekit');


/*
 Now let's define a couple utility functions. We'll use these throughout the app.
 */
var tempPurchasedStore = {};

/**
 * Keeps track (internally) of purchased products.
 * @param identifier The identifier of the Ti.Storekit.Product that was purchased.
 */
function markProductAsPurchased(identifier) {
  Ti.API.info('Marking as purchased: ' + identifier);
  // Store it in an object for immediate retrieval.
  tempPurchasedStore[identifier] = true;
  // And in to Ti.App.Properties for persistent storage.
  Ti.App.Properties.setBool('Purchased-' + identifier, true);
}

/**
 * Checks if a product has been purchased in the past, based on our internal memory.
 * @param identifier The identifier of the Ti.Storekit.Product that was purchased.
 */
function checkIfProductPurchased(identifier) {
  Ti.API.info('Checking if purchased: ' + identifier);
  if (tempPurchasedStore[identifier] === undefined)
    tempPurchasedStore[identifier] = Ti.App.Properties.getBool('Purchased-' + identifier, false);
  return tempPurchasedStore[identifier];
}

/**
 * Requests a product. Use this to get the information you have set up in iTunesConnect, like the localized name and
 * price for the current user.
 * @param identifier The identifier of the product, as specified in iTunesConnect.
 * @param success A callback function.
 * @return A Ti.Storekit.Product.
 */
function requestProduct(identifier, success) {
  showLoading();
  Storekit.requestProducts([identifier], function (evt) {
    hideLoading();
    if (!evt.success) {
      alert('ERROR: We failed to talk to Apple!');
    }
    else if (evt.invalid) {
      alert('ERROR: We requested an invalid product!');
    }
    else {
      success(evt.products[0]);
    }
  });
}

/**
 * Purchases a product.
 * @param product A Ti.Storekit.Product (hint: use Storekit.requestProducts to get one of these!).
 */
function purchaseProduct(product) {
  showLoading();
  Storekit.purchase(product, function (evt) {
    hideLoading();
    switch (evt.state) {
      case Storekit.FAILED:
        alert('Purchase failed!');
        break;
      case Storekit.PURCHASED:
      case Storekit.RESTORED:
        alert('Thank you! Now you can share your generated si3D stereograms with your friends.');
        markProductAsPurchased(product.identifier);
        break;
    }
  });
}

/**
 * Restores any purchases that the current user has made in the past, but we have lost memory of.
 */
function restorePurchases() {
  showLoading();
  Storekit.restoreCompletedTransactions();
}

Storekit.addEventListener('restoredCompletedTransactions', function (evt) {
  hideLoading();
  if (evt.error) {
    alert(evt.error);
  }
  else if (evt.transactions == null || evt.transactions.length == 0) {
    alert('There were no purchases to restore!');
  }
  else {
    for (var i = 0; i < evt.transactions.length; i++) {
      markProductAsPurchased(evt.transactions[i].productIdentifier);
    }
    alert('Restored ' + evt.transactions.length + ' purchases!');
  }
});
