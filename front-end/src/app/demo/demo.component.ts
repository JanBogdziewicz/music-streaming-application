import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { GetDemoService } from '../get-demo.service';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.css']
})
export class DemoComponent implements OnInit {
  constructor(private getDemoService: GetDemoService) { }

  message!: Observable<object>;

  ngOnInit(): void {
    this.message = this.getDemoService.getData();
  }

}
