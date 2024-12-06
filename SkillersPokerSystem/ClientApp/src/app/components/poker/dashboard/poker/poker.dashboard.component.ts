import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
//import { Product } from 'src/app/demo/api/product';
import { AppConfig, LayoutService } from 'src/app/layout/service/app.layout.service';
//import { ProductService } from 'src/app/demo/service/product.service';
import { Table } from 'primeng/table';
import { MenuItem } from 'primeng/api';
import { PlayerService } from 'src/app/services/player.service';
import { Player } from 'src/app/interfaces/player';
import { ApiResult } from 'src/app/services/base.service';

@Component({
    templateUrl: './poker.dashboard.component.html'
})
export class PokerDashboardComponent implements OnInit, OnDestroy {

    subscription!: Subscription;

    items: MenuItem[] = [];

    ordersChart: any;

    ordersChartOptions: any;

    revenueChart: any;

    revenueChartOptions: any;

    cols: any[] = [];

    config!: AppConfig;

    orderWeek: any[] = [];

    metrics: any[] = [];

    players: any[] = [];

    selectedOrderWeek!: any;

    public defaultSortColumn: string = "isActive";
    public defaultSortOrder: string = "DESC";

    constructor(private layoutService: LayoutService,
        private playerService: PlayerService
    ) {
        this.subscription = this.layoutService.configUpdate$.subscribe(config => {
            this.config = config;
            this.initCharts();
        });
    }

    ngOnInit(): void {

        this.playerService.getData<ApiResult<Player>>(0, 50, this.defaultSortColumn, this.defaultSortOrder, "IsActive", "true")
            .subscribe(result => {
                this.players = (result.data);
                console.log(this.players);
                

            }, error => console.error(error));

        this.cols = [
            { field: 'vin', header: 'Vin' },
            { field: 'year', header: 'Year' },
            { field: 'brand', header: 'Brand' },
            { field: 'color', header: 'Color' }
        ];

        this.items = [
            {
                label: 'Shipments',
                items: [
                    { label: 'Tracker', icon: 'pi pi-compass' },
                    { label: 'Map', icon: 'pi pi-map-marker' },
                    { label: 'Manage', icon: 'pi pi-pencil' }
                ]
            }
        ];

        this.orderWeek = [
            { name: 'This Week', code: '0' },
            { name: 'Last Week', code: '1' }
        ];

        this.metrics = [
            {
                title: 'Partidas',
                icon: 'pi pi-shopping-cart',
                color_light: '#64B5F6',
                color_dark: '#1976D2',
                textContent: [
                    { amount: '650', text: 'Finalizadas' }
                ]
            },
            {
                title: 'Revenue',
                icon: 'pi pi-dollar',
                color_light: '#7986CB',
                color_dark: '#303F9F',
                textContent: [
                    { amount: '$2,100', text: 'Expenses' },
                    { amount: '$9,640', text: 'Income' }
                ]
            },
            {
                title: 'Customers',
                icon: 'pi pi-users',
                color_light: '#4DB6AC',
                color_dark: '#00796B',
                textContent: [
                    { amount: 8272, text: 'Active' },
                    { amount: 25402, text: 'Registered' }
                ]
            },
            {
                title: 'Comments',
                icon: 'pi pi-users',
                color_light: '#4DD0E1',
                color_dark: '#0097A7',
                textContent: [
                    { amount: 12, text: 'New' },
                    { amount: 85, text: 'Responded' }
                ]
            }
        ];


        this.initCharts();
    }

    initCharts() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
        this.ordersChart = {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [{
                label: 'New',
                data: [2, 7, 20, 9, 16, 9, 5],
                backgroundColor: [
                    'rgba(100, 181, 246, 0.2)',
                ],
                borderColor: [
                    '#64B5F6',
                ],
                borderWidth: 3,
                fill: true,
                tension: .4
            }]
        };

        this.ordersChartOptions = {
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: textColor
                    }
                }
            },
            hover: {
                mode: 'index'
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: [surfaceBorder],
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary,
                        min: 0,
                        max: 20
                    },
                    grid: {
                        color: [surfaceBorder],
                        drawBorder: false
                    }
                }
            }
        };

        this.revenueChart = {
            labels: ['Direct', 'Promoted', 'Affiliate'],
            datasets: [{
                data: [40, 35, 25],
                backgroundColor: ['#64B5F6', '#7986CB', '#4DB6AC'],
                borderColor: [surfaceBorder]
            }]
        };

        this.revenueChartOptions = {
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: textColor
                    }
                }
            }
        }

    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    changeDataset(event: any) {
        const dataSet = [
            [2, 7, 20, 9, 16, 9, 5],
            [2, 4, 9, 20, 16, 12, 20],
            [2, 17, 7, 15, 4, 20, 8],
            [2, 2, 20, 4, 17, 16, 20]
        ];

        this.ordersChart.datasets[0].data = dataSet[parseInt(event.currentTarget.getAttribute('data-index'))];
        this.ordersChart.datasets[0].label = event.currentTarget.getAttribute('data-label');
        this.ordersChart.datasets[0].borderColor = event.currentTarget.getAttribute('data-stroke');
        this.ordersChart.datasets[0].backgroundColor = event.currentTarget.getAttribute('data-fill');

    }

    recentSales(event: KeyboardEvent) {
        // if ((event.target as HTMLInputElement).value === '0') {
        //     this.products = this.productsThisWeek;
        // } else {
        //     this.products = this.productsLastWeek;
        // }
    }

    updateChartOptions() {
        if (this.config.colorScheme === 'dark')
            this.applyDarkTheme();
        else
            this.applyLightTheme();

    }

    applyDarkTheme() {
        this.ordersChartOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: '#ebedef'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#ebedef'
                    },
                    grid: {
                        color: 'rgba(160, 167, 181, .3)',
                    }
                },
                y: {
                    ticks: {
                        color: '#ebedef'
                    },
                    grid: {
                        color: 'rgba(160, 167, 181, .3)',
                    }
                },
            }
        };
    }

    applyLightTheme() {
        this.ordersChartOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: '#495057'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#495057'
                    },
                    grid: {
                        color: '#ebedef',
                    }
                },
                y: {
                    ticks: {
                        color: '#495057'
                    },
                    grid: {
                        color: '#ebedef',
                    }
                },
            }
        };
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
