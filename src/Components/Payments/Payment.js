// import { NativeModules } from 'react-native'
import { InAppUtils } from 'NativeModules'
import InAppBilling from 'react-native-billing'
// import iapReceiptValidator from 'iap-receipt-validator'
// import {
//   SHARED_SECRET,
//   PRODUCTION
//   // ANNUAL_SUBSCRIPTION_ID
// } from '../Config/Payment'
// const validateReceipt = iapReceiptValidator(SHARED_SECRET, PRODUCTION)

export const paymentsIOS = {
  loadProducts: (products) => {
    return new Promise((resolve, reject) => {
      InAppUtils.loadProducts(products, (error, products) => {
        if (error) {
          reject({ error: error, response: null })
        } else {
          resolve({ error: null, response: products })
        }
      })
    })
  },

  purchaseProduct: (productID) => {
    return new Promise((resolve, reject) => {
      InAppUtils.purchaseProduct(productID, (error, response) => {
        if (error) {
          resolve({ error, response: null })
        } else {
          resolve({ error: null, response })
        }
      })
    })
  },

  restorePurchases: () => {
    return new Promise((resolve, reject) => {
      InAppUtils.restorePurchases((error, response) => {
        if (error) {
          resolve({ response: [] })
        } else {
          resolve({ response, error: null })
        }
      })
    })
  },

  receiptData: () => {
    return new Promise((resolve) => {
      InAppUtils.receiptData((error, receiptData) => {
        if (error) {
          resolve({ response: [], error: error })
        } else {
          resolve({ response: receiptData, error: null })
        }
      })
    })
  },

  validateReceipt: (receiptData) => {
    return new Promise((resolve) => {
      validateReceipt(receiptData)
        .then((response) => {
          resolve({ response: { products: response.receipt.in_app } })
        })
        .catch((error) => {
          resolve({ error, response: null })
        })
    })
  }
}

export const paymentsAndroid = {
    
  loadProducts: (products) => {
    InAppBilling.close()
    return new Promise(resolve => {
      InAppBilling.open()
        .then(() => InAppBilling.getSubscriptionDetailsArray(products))
        .then((response) => {
            alert(JSON.stringify(response))
          InAppBilling.close()
          resolve({ response, error: null })
        })
        .catch((error) => {
          console.tron.log(error)
          InAppBilling.close()
          resolve({ error: 'Details was not found', response: null })
        })
    })
  },

  purchaseProduct: (productID) => {
    InAppBilling.close()
    return new Promise((resolve) => {
      InAppBilling.open()
        .then(() => InAppBilling.subscribe(productID))
        .then((response) => {
          InAppBilling.close()
          resolve({ response, error: null })
        })
        .catch((error) => {
          InAppBilling.close()
          resolve({ response: null, error })
        })
    })
  },

  isSubscribed: (productId) => {
    InAppBilling.close()
    return new Promise((resolve) => {
      InAppBilling.open()
        .then(() => InAppBilling.isSubscribed(productId))
        .then(subscribed => {
          resolve(subscribed)
        })
    })
  },

  restorePurchases: () => {
    let product
    InAppBilling.close()
    return new Promise((resolve) => {
      InAppBilling.open()
        .then(() => InAppBilling.loadOwnedPurchasesFromGoogle())
        .then((response) => console.tron.log(response, 'loadOwnedPurchasesFromGoogle'))
        .then(() => InAppBilling.listOwnedSubscriptions())
        .then(subProductIds => {
          subProductIds = subProductIds || []

          if (subProductIds.length) {
            InAppBilling.getSubscriptionTransactionDetails(subProductIds[0]).then(subscription => {
              product = JSON.parse(subscription.receiptData)
              InAppBilling.close()
              resolve({ response: product })
            })
          } else {
            InAppBilling.close()
            resolve({ response: [] })
          }
        })
    })
  }
}
