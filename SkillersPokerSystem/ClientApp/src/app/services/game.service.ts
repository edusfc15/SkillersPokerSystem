import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService } from './base.service';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GameService
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
        var url = this.baseUrl + 'api/game/GetGames';
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

    get<Game>(id: any): Observable<Game> {
        var url = this.baseUrl + "api/Games/" + id;
        return this.http.get<Game>(url);
    }

    put<Game>(item: any): Observable<Game> {
        var url = this.baseUrl + "api/Games/" + item.id;
        return this.http.put<Game>(url, item);
    }

    post<Game>(item: any): Observable<Game> {
        var url = this.baseUrl + "api/Games";
        return this.http.post<Game>(url, item);
    }

    getGames<ApiResult>(
        pageIndex: number,
        pageSize: number,
        sortColumn: string,
        sortOrder: string,
        filterColumn: string,
        filterQuery: string
    ): Observable<ApiResult> {
        var url = this.baseUrl + 'api/GetGames';
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


}
