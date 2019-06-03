import { TestBed, inject } from '@angular/core/testing';

import { PhotoUploadService } from './photo-upload.service';

describe('PhotoUploadService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PhotoUploadService]
    });
  });

  it('should be created', inject([PhotoUploadService], (service: PhotoUploadService) => {
    expect(service).toBeTruthy();
  }));
});
