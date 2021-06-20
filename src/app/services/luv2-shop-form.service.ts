import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Observable} from 'rxjs'
import {of} from 'rxjs'
import { map } from 'rxjs/operators';
import { Country } from '../common/country';
import { State } from '../common/state';

@Injectable({
  providedIn: 'root'
})
export class Luv2ShopFormService {

  private countriesUrl = 'http://localhost:8080/api/countries';
  private statesUrl = 'http://localhost:8080/api/states';


  constructor(private httpClient:HttpClient) { }

  getCountries():Observable<Country[]>{
    return this.httpClient.get<GetResponseCountries>(this.countriesUrl)
            .pipe(
              map(res => res._embedded.countries)
            );
  }

  getStates(theCountryCode:string):Observable<State[]>{
    const searchUrl = `${this.statesUrl}/search/findByCountryCode?code=${theCountryCode}`;
    return this.httpClient.get<GetResponseStates>(searchUrl)
            .pipe(
              map(res => res._embedded.states)
            );
  }

  getCreditCardMonths(startMonth: number) : Observable<number[]>{
    let data: number[] = [];
    //build array for 'Month' dropdown list
    //start at desird startMonth and loop until 12
    //
    for(let theMonth = startMonth ; theMonth <= 12 ; theMonth++){
      data.push(theMonth);
    }

    return of(data); //the of operator will wrap an object as an observable
  }

  getCreditCardYears() : Observable<number[]>{
    let data: number[] = [];
    //build array for 'Year' dropdown list
    //start at current year and loop for next 10 years
    //
    const startYear: number = new Date().getFullYear();
    const endYear: number = startYear+10

    for(let theYear = startYear ; theYear <= endYear ; theYear++){
      data.push(theYear);
    }
    return of(data); //the of operator will wrap an object as an observable
  }
}

interface GetResponseCountries {
  _embedded:{
    countries : Country[];
  }
}

interface GetResponseStates {
  _embedded:{
    states : State[];
  }
}