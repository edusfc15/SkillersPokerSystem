import { TitleCasePipe } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Ranking } from 'src/app/interfaces/ranking';
import { RankingTotal } from 'src/app/interfaces/rankingTotal';

@Component({
  selector: 'app-ranking-list',
  templateUrl: './ranking-list.component.html',
  styleUrls: ['./ranking-list.component.scss']
})
export class RankingListComponent implements OnInit {

  @Input() type: string;
  ranking: Ranking[];
  rankingTotal: any[];
  form: FormGroup;
  distinctPlayers;
  title: string;
  years;
  selectedMonth: number;
  selectedYear: number;
  monthsDescriptions;
  months;

  constructor(
    private http: HttpClient,
    private titlecasePipe: TitleCasePipe,
    @Inject('BASE_URL') private baseUrl: string,
    private fb: FormBuilder
  ) {
    this.createForm();

  }


  createForm() {
    this.form = this.fb.group({
      RealProfit1: false,
      RealProfit2: false
    });
  }

  ngOnInit(): void {

    this.rankingTotal = [];
    this.years = [];
    this.months = [];
    this.monthsDescriptions = [];

    const formatter = new Intl.DateTimeFormat('pt', { month: 'long' });

    const today = new Date();
    const monthDesc = this.titlecasePipe.transform(today.toLocaleString('pt-br', { month: 'long' }));


    const currentMonth = today.getMonth() + 1;
    var currentYear = new Date().getFullYear();

    for (let i = 0; i <= currentMonth; i++) {
      if (i > 1) {
        this.months.push({ 'number': i });
      }
      if (i < currentMonth) {
        this.monthsDescriptions.push({ 'description': formatter.format(new Date(today.getFullYear(), i, 1, 0, 0, 0, 0)) });
      }

    }

    this.selectedYear = currentYear;
    this.selectedMonth = currentMonth;

    var startYear = 2015;
    while (currentYear >= startYear) {
      this.years.push({ "number": currentYear-- });
    }

    let realprofit = false;
    switch (this.type) {
      case 'mes':
        realprofit = this.form.get('RealProfit2').value;
        this.loadData(new Date().getFullYear(), currentMonth, realprofit);
        this.title = 'Ranking de ' + monthDesc;
        break;
      case 'total':
      default:
        realprofit = this.form.get('RealProfit1').value;
        this.loadData(null, null, realprofit);
        this.title = 'Ranking Total';
        break;
    }

  }

  loadData(year?: number, month?: number, realProfit?: boolean) {

    const url = this.baseUrl + 'api/game/ranking';

    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    var thisYear = new Date().getFullYear();
    var thisMonth = new Date().getMonth();

    var yearForParam = thisYear.toString();
    var monthForParam = "0";
    if (year) {
      yearForParam = year.toString();
    }

    if (month) {
      monthForParam = month.toString();
    }

    var realProfitForParam = String(realProfit)

    var params = new HttpParams()
      .set("year", yearForParam)
      .set("month", monthForParam)
      .set("realProfit", realProfitForParam);

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
          var tmp = {"Posicao" : 0, "Name": '', "Total": 0 };
          for (var j = 0; j < filter.length; j++) {

            tmp.Name = filter[j].Name;

            switch (filter[j].Month) {

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

        this.rankingTotal.forEach( (x) => {
          
        });

        console.log(this.rankingTotal);
        

      }

    );


  }

  
  onChangeMonths(selectedOptions) {

    var monthIndex = selectedOptions[0].index;
    monthIndex++;
    var monthToStart = new Date().getMonth();
    monthToStart++;


  }


  onChangeYear(year) {
    this.loadData(year, 0, this.form.get('RealProfit1').value);

    var now = new Date();
    var thisYear = now.getFullYear()

  }

  onChangeMonth(month) {

    var now = new Date();
    var monthChosen = new Date(now.getFullYear(), month - 1)
    var thisYear = now.getFullYear()
    var monthDesc = this.titlecasePipe.transform(monthChosen.toLocaleString('pt-br', { month: 'long' }));

    this.loadData(thisYear, month, this.form.get('RealProfit2').value);

    this.title = 'Ranking de ' + monthDesc

  }

}
