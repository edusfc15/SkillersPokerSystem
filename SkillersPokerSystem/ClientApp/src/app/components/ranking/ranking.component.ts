
import { Component, Inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { forEach } from '@angular/router/src/utils/collection';

@Component({
  selector: 'ranking',
  templateUrl: 'ranking.component.html',
  styleUrls:['ranking.component.css']
})
export class RankingComponent {

  ranking: Ranking[];
  rankingTotal: RankingTotal[];
  distinctPlayers;
  months;
  years;
  showMonths;
  showLastMonths: boolean;

  constructor(
    private http: HttpClient,
    @Inject('BASE_URL') private baseUrl: string
  ) {

    this.rankingTotal = [];
    this.months = [];
    this.showLastMonths = true;

    var tempDate = new Date().getMonth() + 1;

    for (var i = 0; i <= tempDate; i++) {
      if (i > 1) {
        this.months.push({ "number": i  });
        
      }


    }


    this.years = [];

    var currentYear = new Date().getFullYear();
    var startYear = 2015;
    while (currentYear >= startYear) {
      this.years.push({ "number": currentYear-- });
    }

    this.showMonths =
      {
        "Show1": false,
        "Show2": false,
        "Show3": false,
        "Show4": false,
        "Show5": false,
        "Show6": false,
        "Show7": false,
        "Show8": false,
        "Show9": false,
        "Show10": false,
        "Show11": false,
        "Show12": false
      }
      ;

    this.showMonths["Show" + tempDate ] = true;

    this.loadData();

  }

  loadData(year?: number) {

    var url = this.baseUrl + 'api/game/ranking'

    var headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    var thisYear = new Date().getFullYear();

    this.rankingTotal = [];

    if (year) {
      var params = new HttpParams().set("year", year.toString());
    } else {
      var params = new HttpParams().set("year", thisYear.toString());
    }


    this.http.get<Ranking[]>(url, { headers: headers, params: params }).subscribe(
      res => {

        var rankingPlayers = [];
        this.ranking = res;
        this.ranking.map(x => rankingPlayers.push(x.Name));

        const distinct = (value, index, self) => {
          return self.indexOf(value) === index;
        }

        this.distinctPlayers = rankingPlayers.filter(distinct);

        for (var i = 0; i < this.distinctPlayers.length; i++) {
          var filter = [];
          filter = this.ranking.filter(x => x.Name === this.distinctPlayers[i]);
          var tmp = { "Name": '', "Janeiro": 0, "Fevereiro": 0, "Marco": 0, "Abril": 0, "Maio": 0, "Junho": 0, "Julho": 0, "Agosto": 0, "Setembro": 0, "Outubro": 0, "Novembro": 0, "Dezembro": 0, "Total":0};
          for (var j = 0; j < filter.length; j++) {

            tmp.Name = filter[j].Name;

            switch (filter[j].Month) {
           
              case (1): {
                tmp.Janeiro = filter[j].Total;
                break;
              }
              case (2): {
                tmp.Fevereiro = filter[j].Total;
                break;
              }
              case (3): {
                tmp.Marco = filter[j].Total;
                break;
              }
              case (4): {
                tmp.Abril = filter[j].Total;
                break;
              }
              case (5): {
                tmp.Maio = filter[j].Total;
                break;
              }
              case (6): {
                tmp.Junho = filter[j].Total;
                break;
              }
              case (7): {
                tmp.Julho = filter[j].Total;
                break;
              }
              case (8): {
                tmp.Agosto = filter[j].Total;
                break;
              }
              case (9): {
                tmp.Setembro = filter[j].Total;
                break;
              }
              case (10): {
                tmp.Outubro = filter[j].Total;
                break;
              }
              case (11): {
                tmp.Novembro = filter[j].Total;
                break;
              }
              case (12): {
                tmp.Dezembro = filter[j].Total;
                break;
              }
              case (13): {
                tmp.Total = filter[j].Total;
                break;
              }

              

            }
          }
            this.rankingTotal.push(tmp);

        }

        this.rankingTotal.sort((x, y) => {

          var comparison = 0;

          if (x.Total > y.Total) {
            comparison = -1;
          } else if (x.Total < y.Total) {
            comparison = 1;
          }

          return comparison;
        });
        
      }

    );


  }

  onChangeMonths(selectedOptions) {

    

    var monthIndex = selectedOptions[0].index;
    monthIndex++;
    var monthToStart = new Date().getMonth();
    monthToStart++;

    for (var i = 0; i < Object.keys(this.showMonths).length ; i++) {
      this.showMonths["Show" + i] = false;
    }

    for (monthToStart; monthIndex > 0; monthIndex--) {
      this.showMonths["Show" + monthToStart] = true;
      monthToStart--;
    }

  }


  onChangeYear(year) {
    this.loadData(year);

    var now = new Date();
    var thisYear = now.getFullYear()

    if (year < thisYear) {
      this.showLastMonths = false;

      for (var i = 0; i < Object.keys(this.showMonths).length; i++) {
        this.showMonths["Show" + i] = true;
      }

    } else {

      for (var i = 0; i < Object.keys(this.showMonths).length; i++) {
        this.showMonths["Show" + i] = false;
      }


      this.showLastMonths = true;
      this.showMonths["Show" + (now.getMonth()+ 1)] = true;

    }
  }

}
