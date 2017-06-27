import { Component, OnInit } from '@angular/core';
import { ChartsModule } from 'ng2-charts';
import { HostService} from '../host.service';
import { StudentService } from '../student.service';

@Component({
  selector: 'app-bar-graph',
  templateUrl: './bar-graph.component.html',
  styleUrls: ['./bar-graph.component.css'],
  providers: [HostService, StudentService]
})
export class BarGraphComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  public barChartOptions:any = {
    scaleShowVerticalLines: false,
    responsive: true
  };
  public barChartLabels:string[] = ['A', 'B', 'C', 'D'];
  public barChartType:string = 'bar';
  public barChartLegend:boolean = true;
  public barChartData:any[] = [
    {data: [10, 5, 8, 2], label: 'Series A'}
  ];

  // events
  public chartClicked(e:any):void {
    console.log(e);
  }

  public chartHovered(e:any):void {
    console.log(e);
  }
}