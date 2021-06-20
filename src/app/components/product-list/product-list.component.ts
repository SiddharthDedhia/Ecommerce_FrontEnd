import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from 'src/app/common/cart-item';
import { Product } from 'src/app/common/product';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products: Product[];
  currentCategoryId: number=1;
  previousCategoryId: number = 1;
  searchMode: boolean=false;

  //new properties for pagination
  thePageNumber: number =1;
  thePageSize: number = 5;
  theTotalElements:number = 0;
  previousKeyword: any = null;



  constructor(private productService: ProductService,
              private cartService:CartService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.paramMap.subscribe(()=>{
      this.listProducts();
    });
    
  }

  listProducts(){

    this.searchMode = this.route.snapshot.paramMap.has('keyword');

    if (this.searchMode){
      this.handleSearchProducts();

    }
    else{
    this.handleListProducts();}
    
  }
  handleSearchProducts() {
   const theKeyword: string = this.route.snapshot.paramMap.get('keyword')!;
    //if we have a different keywords that previous we set pagenumber to 1
    if(this.previousKeyword != theKeyword ){
      this.thePageNumber =1;
    }

    this.previousKeyword = theKeyword;
    console.log(`keyword = ${theKeyword} , pagenumber is ${this.thePageNumber}`);

    //now search for the products using keyword
    this.productService.searchProductsPaginate(this.thePageNumber-1,this.thePageSize,theKeyword)
                       .subscribe(this.processResult());
    console.log(this.products);
  
  }

  handleListProducts(){
     //check if "id" parameter is available
     const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id') //returns true or false
     if(hasCategoryId){
       //get the 'id' param string and convert to a number. + converts string to number
       this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;
     }
     else{
       //no category available then assign it 1
       this.currentCategoryId = 1;
     }
     //Check if we have a different category than previous. Note: Angular will reuse a component if its being used

     //if we have a different categoryId than previous than we wanna reset page number to 1
     if(this.previousCategoryId != this.currentCategoryId){
       this.thePageNumber =1;
     }
     this.previousCategoryId = this.currentCategoryId;
     console.log(`current category id = ${this.currentCategoryId} and page number is ${this.thePageNumber}`)
     //now get the product for the given category id
     this.productService.getProductListPaginate(this.thePageNumber-1,this.thePageSize,this.currentCategoryId)// - 1 because in SB its 0 based and in angular its 1 based
                        .subscribe(this.processResult());
  }

  processResult(){
    return data => {
      this.products = data._embedded.products;
      this.thePageNumber = data.page.number +1 ;
      this.thePageSize = data.page.size;
      this.theTotalElements = data.page.totalElements
    };
  }

  updatePageSize(pageSize:number){
    this.thePageSize = pageSize;
    this.thePageNumber =1;
    this.listProducts();
  }

  addToCart(theProduct: Product){
    console.log('Adding to cart');
    console.log(theProduct.name);
    console.log(theProduct.unitPrice);

    const theCartIteam = new CartItem(theProduct);
    this.cartService.addToCart(theCartIteam);
  }
}
