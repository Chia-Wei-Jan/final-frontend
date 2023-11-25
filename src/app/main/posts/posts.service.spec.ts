import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PostService } from './posts.service';
import { of } from 'rxjs';

describe('PostsService', () => {
  let service: PostService;
  let httpTestingController: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // Add this line
      providers: [PostService] 
    });
    service = TestBed.inject(PostService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    httpTestingController.verify(); 
  });
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('LocalStorage Operations', () => {
    it('should save data to local storage', () => {
      spyOn(localStorage, 'setItem');
      const key = 'testKey';
      const data = { sample: 'data' };
      service['saveToLocalStorage'](key, data);
      expect(localStorage.setItem).toHaveBeenCalledWith(key, JSON.stringify(data));
    });

    it('should get data from local storage', () => {
      const key = 'testKey';
      const storedData = { sample: 'data' };
      spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(storedData));
      const result = service['getFromLocalStorage'](key);
      expect(result).toEqual(storedData);
    });

    it('should return null if key does not exist in local storage', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);
      const result = service['getFromLocalStorage']('nonexistentKey');
      expect(result).toBeNull();
    });
  });
  
  describe('getUserById', () => {
    it('should get user by ID from local storage', () => {
      const mockUsers = [
        { id: 1, name: 'User1' },
        { id: 2, name: 'User2' }
      ];
      spyOn(service as any, 'getFromLocalStorage').and.returnValue(mockUsers);
      const userId = 1;
      service.getUserById(userId).subscribe(data => {
        expect(data).toEqual(mockUsers[0]);
      });
    });
  });

  it('should return posts from local storage if they exist', () => {
    const mockPosts = [
      { id: 1, title: 'Post 1', userId: 1 },
      { id: 2, title: 'Post 2', userId: 1 }
    ];

    spyOn(service as any, 'getFromLocalStorage').and.returnValue(mockPosts);

    service.getPostsByIds([1]).subscribe(posts => {
      expect(posts).toEqual(mockPosts);
    });
  });

  it('should fetch posts from API if not in local storage and save them', () => {
    const mockPostsForUser1 = [
      { id: 1, title: 'Post 1', userId: 1 },
      { id: 2, title: 'Post 2', userId: 1 }
    ];

    spyOn(service as any, 'getFromLocalStorage').and.returnValue(null);
    spyOn(service as any, 'saveToLocalStorage');

    service.getPostsByIds([1]).subscribe(posts => {
      expect(posts).toEqual(mockPostsForUser1);
      expect((service as any).saveToLocalStorage).toHaveBeenCalledWith('posts_1', mockPostsForUser1);
    });

    const req = httpTestingController.expectOne(`${service['postUrl']}?userId=1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPostsForUser1);
  });
});
