import { TestBed } from '@angular/core/testing';

import { GetDemoService } from './get-demo.service';

describe('GetDemoService', () => {
  let service: GetDemoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetDemoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
