import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../common/product';
import {map} from 'rxjs/operators';
import { ProductCategory } from '../common/product-category';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  
  private baseUrl = "http://localhost:8080/api/products"; 

  private categoryUrl = "http://localhost:8080/api/product-category"; 

  constructor(private httpClient: HttpClient) { }

  getProduct(theProductId: number): Observable<Product>{
    // need to build url on product id
    const prodUrl = `${this.baseUrl}/${theProductId}`;
    return this.httpClient.get<Product>(prodUrl);
  }


  getProductCategories() : Observable<ProductCategory[]> {
    return this.httpClient.get<GetResponseProductCategory>(this.categoryUrl).pipe(
      map(response => response._embedded.productCategory)
    );
  }

  getProductListPaginate(thePage:number,
                        thePageSize:number,
                        theCategoryId: number): Observable<GetResponseProducts>{
    // need to bouild URL based on category id,page and size
    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}&page=${thePage}&size=${thePageSize}`; //http://localhost:8080/api/products/search/findByCategoryId?id=1&page=0&size=20

    return this.httpClient.get<GetResponseProducts>(searchUrl);
  }

  
  
  getProductList(theCategoryId: number): Observable<Product[]>{
    // need to bouild URL based on category id and 
    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}`;

    return this.getProducts(searchUrl);
  }


  searchProducts(theKeyword: string): Observable<Product[]> {
    const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${theKeyword}`; 
    return this.getProducts(searchUrl);
  }

  searchProductsPaginate(thePage:number,
                          thePageSize:number,
                          theKeyword: string): Observable<GetResponseProducts> {
    const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${theKeyword}`+`&page=${thePage}&size=${thePageSize}`; 
    console.log(searchUrl);
    return this.httpClient.get<GetResponseProducts>(searchUrl);
  }

  private getProducts(searchUrl: string): Observable<Product[]> {
    return this.httpClient.get<GetResponseProducts>(searchUrl).pipe(
      map(response => response._embedded.products)
    );
  }

}

interface GetResponseProducts {
  _embedded: {
    products: Product[];
  },
  page:{
    size:number,
    totalElements: number,
    totalPages: number,
    number:number
  }
}

interface GetResponseProductCategory {
  _embedded: {
    productCategory: ProductCategory[];
  }
}