import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root',
})
export class PlayerService
    extends BaseService {
    constructor(
        http: HttpClient,
        @Inject('BASE_URL') baseUrl: string) {
        super(http, baseUrl);
    }

    getData<ApiResult>(
        pageIndex: number,
        pageSize: number,
        sortColumn: string,
        sortOrder: string,
        filterColumn: string,
        filterQuery: string
    ): Observable<ApiResult> {
        var url = this.baseUrl + 'api/player/all';
        var params = new HttpParams()
            .set("pageIndex", pageIndex.toString())
            .set("pageSize", pageSize.toString())
            .set("sortColumn", sortColumn)
            .set("sortOrder", sortOrder);

        if (filterQuery) {
            params = params
                .set("filterColumn", filterColumn)
                .set("filterQuery", filterQuery);
        }

        return this.http.get<ApiResult>(url, { params });
    }

    getActivePlayers<ApiResult>(
        pageIndex: number,
        pageSize: number,
        sortColumn: string,
        sortOrder: string,
        filterColumn: string,
        filterQuery: string
    ): Observable<ApiResult> {
        var url = this.baseUrl + 'api/player/active';
        var params = new HttpParams()
            .set("pageIndex", pageIndex.toString())
            .set("pageSize", pageSize.toString())
            .set("sortColumn", sortColumn)
            .set("sortOrder", sortOrder);

        if (filterQuery) {
            params = params
                .set("filterColumn", filterColumn)
                .set("filterQuery", filterQuery);
        }

        return this.http.get<ApiResult>(url, { params });
    }
    get<Player>(id:any): Observable<Player> {
        var url = this.baseUrl + "api/player/" + id;
        return this.http.get<Player>(url);
    }

    put<Player>(item:any): Observable<Player> {
        var url = this.baseUrl + "api/player/" + item.id;
        return this.http.put<Player>(url, item);
    }

    post<City>(item:any): Observable<City> {
        var url = this.baseUrl + "api/player";
        return this.http.post<City>(url, item);
    }
}
