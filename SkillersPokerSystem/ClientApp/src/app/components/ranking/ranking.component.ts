
import { Component, Inject, Input, OnInit } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { TitleCasePipe } from '@angular/common';
import { FormBuilder, Form, FormGroup } from '@angular/forms';

@Component({
  selector: 'ranking',
  templateUrl: 'ranking.component.html',
  styleUrls: ['ranking.component.css']
})
export class RankingComponent implements OnInit {

  @Input() type: string;
  ranking: Ranking[];
  rankingTotal: RankingTotal[];
  distinctPlayers;
  months;
  years;
  showMonths;
  monthsDescriptions;
  showLastMonths: boolean;
  title: string;
  mensal: boolean;
  form: FormGroup;
  selectedMonth: number;
  selectedYear: number;

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

  ngOnInit() {

    const formatter = new Intl.DateTimeFormat('pt', { month: 'long' });

    this.mensal = this.type === 'mes';

    this.rankingTotal = [];
    this.months = [];
    this.monthsDescriptions = [];
    this.showLastMonths = true;

    const today = new Date();

	const currentMonth = today.getMonth() + 1;
	var currentYear = new Date().getFullYear();

	this.selectedYear = currentYear;
	this.selectedMonth = currentMonth;

    const monthDesc = this.titlecasePipe.transform(today.toLocaleString('pt-br', { month: 'long' }));


    for (let i = 0; i <= currentMonth; i++) {
      if (i > 1) {
        this.months.push({ 'number': i });
      }
      if (i < currentMonth){
        this.monthsDescriptions.push({ 'description': formatter.format(new Date(today.getFullYear(), i, 1, 0, 0, 0, 0)) });
      }

    }

    this.years = [];

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

    this.showMonths['Show' + currentMonth] = true;

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

    this.rankingTotal = [];

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
          var tmp = { "Name": '', "Janeiro": 0, "Fevereiro": 0, "Marco": 0, "Abril": 0, "Maio": 0, "Junho": 0, "Julho": 0, "Agosto": 0, "Setembro": 0, "Outubro": 0, "Novembro": 0, "Dezembro": 0, "Total": 0 };
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

    for (var i = 0; i < Object.keys(this.showMonths).length; i++) {
      this.showMonths["Show" + i] = false;
    }

    for (monthToStart; monthIndex > 0; monthIndex--) {
      this.showMonths["Show" + monthToStart] = true;
      monthToStart--;
    }

  }


  onChangeYear(year) {
    this.loadData(year, 0, this.form.get('RealProfit1').value);

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
      this.showMonths["Show" + (now.getMonth() + 1)] = true;

    }


  }

  onChangeMonth(month) {

    var now = new Date();
    var monthChosen = new Date(now.getFullYear(), month - 1)
    var thisYear = now.getFullYear()
    var monthDesc = this.titlecasePipe.transform(monthChosen.toLocaleString('pt-br', { month: 'long' }));
	console.log(month);

    this.loadData(thisYear, month,this.form.get('RealProfit2').value);

    this.title = 'Ranking de ' + monthDesc

  }

}
