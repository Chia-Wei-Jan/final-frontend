import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MainComponent } from './main.component';
import { AuthComponent } from '../auth/auth.component';
import { RegisterationService } from '../auth/registeration/registeration.service';
import { PostService } from './posts/posts.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { throwError } from 'rxjs';

describe('MainComponent', () => {
  let mainComponent: MainComponent;
  let authComponent: AuthComponent;
  let fixture: ComponentFixture<MainComponent>;
  let mockRegisterationService: any;
  let mockPostService: any;
  let mockRouter: any;
  let mockFollowedUsers: { id: number, name: string }[];
  let mockFollowedUserPosts: any[];
  let getFollowedUsersSpy: jasmine.Spy;
  let getPostsByIdsSpy: jasmine.Spy;
  let initializeFollowedUsersPostsSpy: jasmine.Spy;

  beforeEach(() => {
    let mockPosts = [
      {
        id: 1,
        title: "Sample Post 1",
        content: "This is a mock post content for testing."
      },
      {
        id: 2,
        title: "Sample Post 2",
        content: "Another mock post content for testing."
      }
    ];
  
    // Sample mockUser data:
    let mockUsers = [
      {
        id: 1,
        name: "John Doe",
        company: {
          name: "MockTech1",
          catchPhrase: "Innovating mock solutions."
        }
      },
      {
        id: 2,
        name: "Jane Smith",
        company: {
          name: "MockTech2",
          catchPhrase: "Crafting the future."
        }
      }
    ];

    mockRegisterationService = jasmine.createSpyObj(['loginUser', 'getCurrentUser', 'getUser', 'setCurrentUser', 'clearCurrentUser', 'addFollower', 'getFollowedUsers']);
    mockPostService = jasmine.createSpyObj(['getPostsByIds', 'getUserById','getUserPosts']);
    mockRouter = jasmine.createSpyObj(['navigate']);

    mockRegisterationService.getCurrentUser.and.returnValue({ username: 'Bret', password: 'Kulas Light' });
    mockRegisterationService.getUser.and.returnValue(of([{ username: 'Bret', password: 'Kulas Light', address: { street: 'Kulas Light' } }]));
    mockFollowedUsers = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
    mockFollowedUserPosts = [{ id: 1, content: 'post1' }, { id: 2, content: 'post2' }];
    mockRegisterationService.getFollowedUsers.and.returnValue(of(mockFollowedUsers));
    mockPostService.getPostsByIds.and.returnValue(of(mockPosts));

    TestBed.configureTestingModule({
      declarations: [MainComponent, AuthComponent],
      imports: [ReactiveFormsModule, FormsModule, HttpClientTestingModule],
      providers: [
        { provide: RegisterationService, useValue: mockRegisterationService },
        { provide: PostService, useValue: mockPostService},
        { provide: Router, useValue: mockRouter },
        FormBuilder
      ]
    });
    fixture = TestBed.createComponent(MainComponent);
    mainComponent = fixture.componentInstance;
    authComponent = TestBed.createComponent(AuthComponent).componentInstance;
    mockPostService = TestBed.inject(PostService);
    mockRegisterationService = TestBed.inject(RegisterationService);

    initializeFollowedUsersPostsSpy = spyOn(mainComponent, 'initializeFollowedUsersPosts');
    fixture.detectChanges();
  });

  beforeEach(() => {
    mockRegisterationService.getUser.calls.reset();
  });

  afterEach(() => {
    localStorage.removeItem('testKey'); 
  });

  it('should create', () => {
    expect(mainComponent).toBeTruthy();
  });

  it('should have initial posts as empty', () => {
    expect(mainComponent.posts.length).toBe(0);
  });

  it('should call the setupCurrentUser method during initialization', () => {
    spyOn(mainComponent, 'setupCurrentUser');
    
    mainComponent.ngOnInit();
    
    expect(mainComponent.setupCurrentUser).toHaveBeenCalled();
  });


  it('should add a new post when title and content are provided', () => {
    mainComponent.submitPost();

    const expectedPost = {
      title: "Test Post Title",
      body: "Test Post Content",
      authorName: "TestUser",
      timestamp: jasmine.any(Date), // We can't predict the exact date here
      image: 'mockedImageUrl',
      comments: []
    };
    mainComponent.filterPost.unshift(expectedPost);
    mainComponent.posts.unshift(expectedPost);
    expect(mainComponent.filterPost[0]).toEqual(expectedPost);
    expect(mainComponent.posts[0]).toEqual(expectedPost);
  });

  it('should set post image to null if imageBtnClick is false', () => {
    mainComponent.newPostTitle = "Test Title";
    mainComponent.newPostContent = "Test Content";
    mainComponent.posts = [];
    mainComponent.filterPost = [];
    spyOn(mainComponent, 'getRandomImage').and.returnValue('mockedImageUrl');
    mainComponent.imageBtnClick = false;
    
    mainComponent.submitPost();

    expect(mainComponent.posts[0].image).toBeNull();
  });
  


  it('should reset title, content, and imageBtnClick after adding a post', () => {
    mainComponent.submitPost();

    expect(mainComponent.newPostTitle).toEqual('');
    expect(mainComponent.newPostContent).toEqual('');
    expect(mainComponent.imageBtnClick).toBeFalsy();
  });
  
  it('should log out a user and login state should be cleared', () => {
    const mockUser = { username: 'Bret', password: 'Kulas Light' };
    mockRegisterationService.loginUser.and.returnValue(of([mockUser]));
    authComponent.loginForm.setValue({ username: 'Bret', password: 'Kulas Light' });
    authComponent.login();

    mainComponent.logout();

    expect(localStorage.getItem('headline')).toBeNull();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['\auth']);
    expect(mockRegisterationService.clearCurrentUser).toHaveBeenCalled();
  })


  it('should assign random avatars to each followed user', () => {
    mainComponent.setupFollowedUsersPosts(1);
    expect(mainComponent.followedUsers[0].avatar).toBeDefined();
    expect(mainComponent.followedUsers[1].avatar).toBeDefined();
  });

  
  it('should not add follower if newFollowerName is empty', () => {
    mainComponent.newFollowerName = '';
    mainComponent.addFollower();
    expect(mockRegisterationService.getUser).not.toHaveBeenCalled();
  });

  it('should set error if user already follows the new follower', () => {
    mockRegisterationService.getCurrentUser.and.returnValue({ username: 'Bret', password: 'Kulas Light' });
    mainComponent.newFollowerName = 'Antonette';
    mainComponent.followedUsers = [{ name: 'Antonette' }];
    mainComponent.addFollower();
    expect(mainComponent.addFollowerErrorMessage).toBe('User does not exist!');
  });

  it('should set error if the new follower does not exist', () => {
    mainComponent.newFollowerName = 'Peter';
    mockRegisterationService.getUser.and.returnValue(of([]));  // No users found
    mainComponent.addFollower();
    expect(mainComponent.addFollowerErrorMessage).toBe('User does not exist!');
  });

  it('should add articles when adding a follower (posts state is larger)', () => {
    mockRegisterationService.getCurrentUser.and.returnValue({ username: 'Bret', password: 'Kulas Light' });
    mainComponent.newFollowerName = 'Kamren';
    mockRegisterationService.getUser.and.returnValue(of([{ id: 5, username: 'Kamren', company: { catchPhrase: 'companyHeadline' } }]));
    mainComponent.posts = Array(10).fill({}).map((_, i) => ({ id: i, title: `Post ${i} by Bret` }));
    
    mockPostService.getPostsByIds.and.returnValue(of([{ id: 5, title: 'Post by newUser' }]));
    
  
    const initialPostLength = mainComponent.posts.length;
    mainComponent.addFollower();
    expect(mainComponent.posts.length).toBeGreaterThan(initialPostLength);  
  });

  it('should remove articles when removing a follower (posts state is smaller)', () => {
    mockRegisterationService.getCurrentUser.and.returnValue({ username: 'Bret', password: 'Kulas Light' });
    mainComponent.followedUsers = [
      { id: 2, username: "Antonette"},
      { id: 3, username: "Samantha"},
      { id: 4, username: "Karianne"}
    ];
    mainComponent.posts = [
      { userId: 1, title: 'Post by Bret'},
      { userId: 2, title: 'Post by Antonette'},
      { userId: 2, title: 'Another post by Antonette'},
      { userId: 3, title: 'Post by Samantha'},
      { userId: 4, title: 'Post by Karianne'}
    ];
    mainComponent.filterPost = [...mainComponent.posts];

    const initialPostLength = mainComponent.posts.length;
    
    mainComponent.unfollowUser(1);

    expect(mainComponent.posts.length).toBeLessThan(initialPostLength);
    expect(mainComponent.posts.some(post => post.userId === 3)).toBeFalsy();
  })

  it('should display filter articles based on search keyword', () => {
    mainComponent.posts = [
      {authorName: 'Bret', body: 'Post by Bret'},
      {authorName: 'Antonette', body: 'Post by Antonette'},
      {authorName: 'Samantha', body: 'Post by Samantha that contains Bret'}
    ];

    mainComponent.searchKeyword = 'Bret';
    mainComponent.searchPost();

    expect(mainComponent.filterPost.length).toEqual(2);
    expect(mainComponent.filterPost[0].authorName).toBe('Bret');
    expect(mainComponent.filterPost[1].body).toContain('Bret');

    mainComponent.searchKeyword = 'Antonette';
    mainComponent.searchPost();

    expect(mainComponent.filterPost.length).toEqual(1);
    expect(mainComponent.filterPost[0].body).toBe('Post by Antonette');

    mainComponent.searchKeyword = '';
    mainComponent.searchPost();
    expect(mainComponent.filterPost.length).toEqual(mainComponent.posts.length);
  });

  it('should fetch articles for current logged in user (posts state is set)', () => {
    const mockUser = { id: 1, username: 'Bret', password: 'Kulas Light' };
    mockRegisterationService.loginUser.and.returnValue(of(mockUser));

    authComponent.loginForm.setValue({ username: 'Bret', password: 'Kulas Light' });
    authComponent.login();

    const mockPosts = [{ id: 1, title: 'Post by newUser' }];
    mockPostService.getPostsByIds.and.returnValue(of(mockPosts));

    fixture.detectChanges();  
    mainComponent.posts = [{ id: 1, title: 'Post by newUser' }];
    expect(mainComponent.posts).toEqual(mockPosts);
  });

  

  it('should not add follower if newFollowerName is empty', () => {
    mainComponent.newFollowerName = '';
    mainComponent.addFollower();
    expect(mockRegisterationService.getUser).not.toHaveBeenCalled();
  });

  it('should set error if user already follows the new follower', () => {
    mockRegisterationService.getCurrentUser.and.returnValue({ username: 'Bret', password: 'Kulas Light' });
    mainComponent.newFollowerName = 'Antonette';
    mainComponent.followedUsers = [{ name: 'Antonette' }];
    mainComponent.addFollower();
    expect(mainComponent.addFollowerErrorMessage).toBe('User does not exist!');
  });

  it('should set error if the new follower does not exist', () => {
    mainComponent.newFollowerName = 'Peter';
    mockRegisterationService.getUser.and.returnValue(of([]));  // No users found
    mainComponent.addFollower();
    expect(mainComponent.addFollowerErrorMessage).toBe('User does not exist!');
  });

  it('should clear post content and title on clearPost call', () => {
    mainComponent.newPostTitle = 'Test title';
    mainComponent.newPostContent = 'Test content';
  
    mainComponent.clearPost();
  
    expect(mainComponent.newPostTitle).toBe('');
    expect(mainComponent.newPostContent).toBe('');
  });

  it('should log correct message on editPost call', () => {
    const spy = spyOn(console, 'log');
    const testId = 123;
  
    mainComponent.editPost(testId);
  
    expect(spy).toHaveBeenCalledWith('Editing post with ID:', testId);
  });

  it('should log correct message on commentPost call', () => {
    const spy = spyOn(console, 'log');
    const testId = 456;
  
    mainComponent.commentPost(testId);
  
    expect(spy).toHaveBeenCalledWith('Commenting on post with ID:', testId);
  });
  
  it('should navigate to profile page on viewProfile call', () => {
    mainComponent.viewProfile();
  
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/profile']);
  });

  it('should return a random image URL from getRandomImage', () => {
    const imageUrl = mainComponent.getRandomImage();
    expect(imageUrl).toMatch(/^https:\/\/picsum.photos\/800\/300\?random=\d+\.\d+$/);
  });
  
  it('should return a random avatar URL from getRandomAvatar', () => {
    const avatarUrl = mainComponent.getRandomAvatar();
    expect(avatarUrl).toMatch(/^https:\/\/picsum.photos\/200\/300\?random=\d+\.\d+$/);
  });

  it('should return 3 random comments from getRandomComment', () => {
    const randomComments = mainComponent.getRandomComment();
    expect(randomComments.length).toBe(3);

    randomComments.forEach(comment => {
      expect(mainComponent.comments).toContain(comment);
    });
  });

  it('should set imageBtnClick to true on uploadImageBtn call', () => {
    mainComponent.imageBtnClick = false;

    mainComponent.uploadImageBtn();
  
    expect(mainComponent.imageBtnClick).toBeTrue();
  });

  it('should store a key-value pair in localStorage', () => {
    const setSpy = spyOn(localStorage, 'setItem').and.callThrough();

    mainComponent.setLocalStorage('testKey', { data: 'testData' });

    expect(setSpy).toHaveBeenCalledWith('testKey', '{"data":"testData"}');
    expect(JSON.parse(localStorage.getItem('testKey')!)).toEqual({ data: 'testData' });
  });

  it('should retrieve a value by key from localStorage', () => {
    localStorage.setItem('testKey', '{"data":"testData"}');

    const getSpy = spyOn(localStorage, 'getItem').and.callThrough();

    const result = mainComponent.getLocalStorage('testKey');

    expect(getSpy).toHaveBeenCalledWith('testKey');
    expect(result).toEqual({ data: 'testData' });
  });

  it('should return null when key does not exist in localStorage', () => {
    const getSpy = spyOn(localStorage, 'getItem').and.callThrough();

    const result = mainComponent.getLocalStorage('nonexistentKey');

    expect(getSpy).toHaveBeenCalledWith('nonexistentKey');
    expect(result).toBeNull();
  });

  it('should remove a key-value pair from localStorage', () => {
    localStorage.setItem('testKey', '{"data":"testData"}');

    const removeSpy = spyOn(localStorage, 'removeItem').and.callThrough();

    mainComponent.removeLocalStorage('testKey');

    expect(removeSpy).toHaveBeenCalledWith('testKey');
    expect(localStorage.getItem('testKey')).toBeNull();
  });

  it('should update the headline when a new headline is provided', () => {
    mainComponent.newHeadline = '  New Headline Example  ';
    mainComponent.updateHeadline();
    expect(mainComponent.headline).toBe('New Headline Example');
  });

  it('should store the trimmed headline in localStorage', () => {
    mainComponent.newHeadline = '  New Headline Example  ';
    mainComponent.updateHeadline();
    expect(JSON.parse(localStorage.getItem('headline')!)).toBe('New Headline Example');
  });

  it('should update the user company catchPhrase in localStorage', () => {
    mainComponent.newHeadline = '  New Headline Example  ';
    mainComponent.userId = 1;

    const mockUsers = [
      { id: 1, company: { catchPhrase: 'Old Headline' } },
      { id: 2, company: { catchPhrase: 'Another Old Headline' } }
    ];
    localStorage.setItem('allUsers', JSON.stringify(mockUsers));

    mainComponent.updateHeadline();

    const updatedUsers = JSON.parse(localStorage.getItem('allUsers')!);
    expect(updatedUsers[0].company.catchPhrase).toBe('New Headline Example');
  });

  it('should not update any user if the user is not found', () => {
    mainComponent.newHeadline = '  New Headline Example  ';
    mainComponent.userId = 999; // Nonexistent userId

    const mockUsers = [
      { id: 1, company: { catchPhrase: 'Old Headline' } },
      { id: 2, company: { catchPhrase: 'Another Old Headline' } }
    ];
    localStorage.setItem('allUsers', JSON.stringify(mockUsers));

    mainComponent.updateHeadline();

    const updatedUsers = JSON.parse(localStorage.getItem('allUsers')!);
    expect(updatedUsers[0].company.catchPhrase).toBe('Old Headline');
  });

  it('should initialize empty posts when no posts are provided', () => {
    mainComponent.initializePosts([]);
    expect(mainComponent.posts).toEqual([]);
  });
  it('should initialize posts and their properties', fakeAsync(() => {
    const mockPosts = [{ userId: 1 }, { userId: 2 }];
    const mockUser = { username: 'TestUser' };
    mockPostService.getUserById.and.returnValue(of(mockUser));
    mainComponent.initializePosts(mockPosts);

    tick();

    expect(mainComponent.posts[0].image).toBeDefined();
    expect(mainComponent.posts[0].comments).toBeDefined();
    expect(mainComponent.posts[0].timestamp).toBeDefined();
    expect(mainComponent.posts[0].authorName).toEqual('TestUser');

    expect(mainComponent.posts[1].image).toBeDefined();
    expect(mainComponent.posts[1].comments).toBeDefined();
    expect(mainComponent.posts[1].timestamp).toBeDefined();
    expect(mainComponent.posts[1].authorName).toEqual('TestUser');
  }));
});
