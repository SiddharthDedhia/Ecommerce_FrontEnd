import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { Luv2ShopFormService } from 'src/app/services/luv2-shop-form.service';
import { Luv2ShopValidators } from 'src/app/validators/luv2-shop-validators';


@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup: FormGroup;
  shippingAddressState: State[] = [];
  billingAddressState: State[] = [];
  totalPrice : number = 0;
  totalQuantity : number = 0;

  creditCardMonths: number[] = [];
  creditCardYears: number[] = [];

  countries: Country[] = [];

  constructor(private formBuilder: FormBuilder,
    private luv2ShopFormService : Luv2ShopFormService,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router) { }
  ngOnInit(): void {

      this.reviewCartDetails();
      //build the form. cuatomer is formgroup name , firstname is formcontrol name and empty string is the initial value of formcontrol
      this.checkoutFormGroup = this.formBuilder.group({
        customer: this.formBuilder.group({
          firstName: new FormControl('',[Validators.required,
                                        Validators.minLength(2),
                                        Luv2ShopValidators.notOnlyWhiteSpace]),
          lastName: new FormControl('',[Validators.required,
                                        Validators.minLength(2),
                                        Luv2ShopValidators.notOnlyWhiteSpace]),
          email: new FormControl('',[Validators.required,
                                    Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
                                    Luv2ShopValidators.notOnlyWhiteSpace])
        }),
        shippingAdress: this.formBuilder.group({
          country:new FormControl('',[Validators.required]),
          street: new FormControl('',[Validators.required,
                                      Validators.minLength(2),
                                      Luv2ShopValidators.notOnlyWhiteSpace]),
          city: new FormControl('',[Validators.required,
                                    Validators.minLength(2),
                                    Luv2ShopValidators.notOnlyWhiteSpace]),
          state: new FormControl('',[Validators.required]),
          zipCode: new FormControl('',[Validators.required,
                                      Validators.minLength(2),
                                      Luv2ShopValidators.notOnlyWhiteSpace])
        }),
        billingAddress: this.formBuilder.group({
          country: new FormControl('',[Validators.required]),
          street: new FormControl('',[Validators.required,
                                      Validators.minLength(2),
                                      Luv2ShopValidators.notOnlyWhiteSpace]),
          city: new FormControl('',[Validators.required,
                                    Validators.minLength(2),
                                    Luv2ShopValidators.notOnlyWhiteSpace]),
          state: new FormControl('',[Validators.required]),
          zipCode: new FormControl('',[Validators.required,
                                      Validators.minLength(2),
                                      Luv2ShopValidators.notOnlyWhiteSpace])
        }),
        creditCard: this.formBuilder.group({
          cardType: new FormControl('',[Validators.required]),
          nameOnCard: new FormControl('',[Validators.required,
                                          Validators.minLength(2),
                                          Luv2ShopValidators.notOnlyWhiteSpace]),
          cardNumber:  new FormControl('',[Validators.required,
                                           Validators.pattern('[0-9]{16}')]),
          securityCode: new FormControl('',[Validators.required,
                                            Validators.pattern('[0-9]{3}')]),
          expirationMonth: [''],
          expirationYear: ['']
        })
      });

      //populate credit card months
      // JS date object , the months are zero based hence the +1
      const startMonth : number = new Date().getMonth() + 1;
      console.log("startmonth is" + startMonth)

      this.luv2ShopFormService.getCreditCardMonths(startMonth).subscribe(
        data => {
          console.log("Retrieved credit card months: " + JSON.stringify(data));
          this.creditCardMonths = data
        }
      );
      //populate credit card years

      this.luv2ShopFormService.getCreditCardYears().subscribe(
        data => {
          console.log("Retrieved credit card years: " + JSON.stringify(data));
          this.creditCardYears = data
        }
      );

      //populate countries
      this.luv2ShopFormService.getCountries().subscribe(
        data=>{
          console.log("Retrieved Countries: " +  JSON.stringify(data));
          this.countries=data;
        }
      );


  }
  reviewCartDetails() {
    this.cartService.totalQuantity.subscribe(
      totalQuantity => this.totalQuantity = totalQuantity
    );

    this.cartService.totalPrice.subscribe(
      totalPrice => this.totalPrice = totalPrice
    );

  }

  onSubmit(){
    console.log("hangling the form submit button")

    if(this.checkoutFormGroup.invalid){
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    // set up order
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    // get cart items
    const cartItems = this.cartService.cartItems;

    //create orderItems from cartItems
    let orderItems: OrderItem[] = [];
    for(let i=0;i< cartItems.length;i++){
      orderItems[i]= new OrderItem(cartItems[i]);
    }

    //set up purchase
    let purchase = new Purchase();

    //populate purchase -customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;
   
    //populate purchase - shipping address
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAdress'].value;
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;

    //populate purchase - billing address
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCountry.name;

    //populate purchase - order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItems;

    //call REST API via the CheckoutService
    this.checkoutService.placeOrder(purchase).subscribe(
      {
        //we do error handling , here next - error is like try-error
        next: response => {
          alert(`Your order tracking number is ${response.orderTrackingNumber}`);
          //reset cart
          this.resetCart();
          console.log('Successful')
        },
        error: err => {
          alert(`There was an error: ${err.message}`)
        }
      }
    );

  }
  resetCart() {
   // reset cart data
    this.cartService.cartItems=[];
    this.cartService.totalPrice.next(0); //send 0 to all subsrcibers there so they reset tehmselves
    this.cartService.totalQuantity.next(0);
   
    //reset the form data
    this.checkoutFormGroup.reset();

   //navigate back to homepage - product page
    this.router.navigateByUrl("/products")
  }

  copyShippingAddressToBillingAddress(event){

    if(event.target.checked){
      this.checkoutFormGroup.controls.billingAddress
      .setValue(this.checkoutFormGroup.controls.shippingAdress.value);

      //bug fix for states
      this.billingAddressState = this.shippingAddressState;
    }
    else{
      this.checkoutFormGroup.controls.billingAddress.reset();
      this.billingAddressState = [];
    }

  }

  handleMonthsAndYears(){
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');

    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup.value.expirationYear)

    //if current year == selected year we start with current month
    let startMonth : number;

    if(currentYear==selectedYear){
      startMonth = new Date().getMonth() + 1;
    }
    else{
      startMonth = 1;
    }

    this.luv2ShopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrieved credit card months: " + JSON.stringify(data));
        this.creditCardMonths = data
      }
    );
  }

  getStates(formGroupName:string){
    const formGroup = this.checkoutFormGroup.get(formGroupName);
    const countryCode = formGroup.value.country.code;

    this.luv2ShopFormService.getStates(countryCode).subscribe(
      data=>{
        if (formGroupName==='shippingAdress'){
          this.shippingAddressState=data;
        }
        else{
          this.billingAddressState=data;
        }

        //select first item by default

        formGroup.get('state').setValue(data[0]);
      }
    );
  }

  get firstName(){return this.checkoutFormGroup.get('customer.firstName');}
  get lastName(){return this.checkoutFormGroup.get('customer.lastName');}
  get email(){return this.checkoutFormGroup.get('customer.email');}

  get shippingAdressStreet(){return this.checkoutFormGroup.get('shippingAdress.street');}
  get shippingAdressCity(){return this.checkoutFormGroup.get('shippingAdress.city');}
  get shippingAdressState(){return this.checkoutFormGroup.get('shippingAdress.state');}
  get shippingAdressCountry(){return this.checkoutFormGroup.get('shippingAdress.country');}
  get shippingAdressZipCode(){return this.checkoutFormGroup.get('shippingAdress.zipCode');}
 
  get billingAdressStreet(){return this.checkoutFormGroup.get('billingAddress.street');}
  get billingAdressCity(){return this.checkoutFormGroup.get('billingAddress.city');}
  get billingAdressState(){return this.checkoutFormGroup.get('billingAddress.state');}
  get billingAdressCountry(){return this.checkoutFormGroup.get('billingAddress.country');}
  get billingAdressZipCode(){return this.checkoutFormGroup.get('billingAddress.zipCode');}

  get creditCardType(){return this.checkoutFormGroup.get('creditCard.cardType');}
  get creditCardNameOnCard(){return this.checkoutFormGroup.get('creditCard.nameOnCard');}
  get creditCardNumber(){return this.checkoutFormGroup.get('creditCard.cardNumber');}
  get creditCardSecurityCode(){return this.checkoutFormGroup.get('creditCard.securityCode');}
  
}