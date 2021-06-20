import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { CartItem } from '../common/cart-item';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems: CartItem[]=[];

  totalPrice: Subject<number> = new BehaviorSubject<number>(0); //we use subject to publish events in our code
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0); //we set initial quantity to  0

  //storage: Storage = sessionStorage;//we get refernce to sesionstorage automatically.
  storage: Storage = localStorage;

  constructor() {
    // read data from storage

    let data = JSON.parse(this.storage.getItem('cartItems'));

    if (data!=null){
      this.cartItems = data;

      // compute totals based on the data that is read from storage
      this.computerCartTotoals();
    }

   }

  addToCart(theCartItem:CartItem){
    // check if we already have the item in our  cart
    let alreadyExistsInCart: boolean = false;
    let existingCartItem: CartItem = undefined;

    if(this.cartItems.length>0){
      //find the item in cart based on item id
      existingCartItem = this.cartItems.find(tempCartItem => tempCartItem.id===theCartItem.id)
      //check if we find it
      alreadyExistsInCart = (existingCartItem!=undefined);
    }

    //just add the item to the array
    if(alreadyExistsInCart){
      existingCartItem.quantity++;
    }
    else{
      this.cartItems.push(theCartItem);
    }

    //compute cart total price and total quantity
    this.computerCartTotoals();
    
  }
  computerCartTotoals() {
    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    for(let i of this.cartItems){
      totalPriceValue+= i.quantity * i.unitPrice;
      totalQuantityValue += i.quantity;
    }

    // publish the new values ....all subsribers will receive the new data
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    //log cart data just for debuggning purposes
    this.logCartData(totalPriceValue,totalQuantityValue)

    //persist cart data
    this.persistCartItems();
  }
  logCartData(totalPriceValue: number, totalQuantityValue: number) {
    console.log("contents of the cart");
    console.log(totalPriceValue);
    console.log(totalQuantityValue);
  }

  decrementQuantity(theCartItem: CartItem) {
    theCartItem.quantity--;
    if(theCartItem.quantity === 0){
      this.remove(theCartItem)
    }
    else{
      this.computerCartTotoals();
    }
  }
  remove(theCartItem: CartItem) {
    // get index of item in the array
    const itemIndex = this.cartItems.findIndex(
      i => i.id == theCartItem.id
    );
    //if found lets remove item from the array at the given index
    if(itemIndex>-1){
      this.cartItems.splice(itemIndex,1); // ,1 meands remove one item from the array
      this.computerCartTotoals();
    }
  }

  persistCartItems(){
    this.storage.setItem('cartItems',JSON.stringify(this.cartItems));
  }
}
