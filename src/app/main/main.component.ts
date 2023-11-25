import { Component, OnInit } from '@angular/core';
import { PostService } from './posts/posts.service';
import { RegisterationService } from '../auth/registeration/registeration.service';
import { ProfileService } from '../profile/profile.service';
import { Router } from '@angular/router';
import { catchError, of, forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})


export class MainComponent implements OnInit {

  headline: string = '';
  newHeadline: string = ''; 
  avatarUrl: string = 'https://brand.rice.edu/sites/g/files/bxs2591/files/2019-08/190308_Rice_Mechanical_Brand_Standards_Logos-2.png'; // Assuming a local path; replace with actual path


  posts: any[] = []; // Store the posts
  user: any;
  username: string = '';
  userId: any;

  newPostTitle: string = '';
  newPostContent: string = '';

  searchKeyword: string = '';
  filterPost: any[] = [];

  followedUsers: any[] = [];
  followedUsersDetails: any[] = [];
  timestamp: any[] = [];
  newFollowerName: string = '';
  imageBtnClick: boolean = false;
  catchPhrases: string[] = [
    'Bridging the gap.',
    'A touch of genius.',
    'Accelerate your world.',
    'Driven by passion.',
    'Think different.',
    'Making a difference.',
    'Future is now.',
    'Beyond boundaries.',
    'Innovate, integrate, captivate.',
    'Excellence in action.',
    'Change the world.',
    'Inspiration comes standard.',
    'Reach for the skies.',
    'Redefining possibilities.',
    'Breaking barriers.',
    'Pushing the limits.',
    'Challenge everything.',
    'Imagine. Innovate. Inspire.',
    'Simplicity is the ultimate sophistication.',
    'We make dreams a reality.'
  ];


  defaultHeadline: string = 'Default follower headline!';

  selectImage: File | null = null;
  newUser: boolean = false;
  allUsers: any[] = [];
  addFollowerErrorMessage: String = '';

  currentDate = new Date('2023-10-13');

  showComment: boolean = false; 
  newComment: string = ''; 

  comments: string[] = [
    "Amy: Wow, this really brings back memories.",
    "John: Congratulations on your achievement!",
    "Sophia: Keeping you in my thoughts and prayers.",
    "Ethan: Your photos are always so captivating.",
    "Liam: The kids have grown so much! They look wonderful.",
    "Olivia: This genuinely made me laugh out loud.",
    "Emma: Interesting post! Could you share the source?",
    "Noah: It's been ages! We should definitely reconnect soon.",
    "Ava: I feel this on a personal level.",
    "James: Wishing you a joyous birthday and many happy returns.",
    "Charlotte: Stunning scenery! Where was this taken?",
    "Mia: Your style is impeccable. Where did you buy that outfit?",
    "Elijah: I appreciate the suggestion. I'll give it a try.",
    "Lucas: Missing our times together. Hope we can meet up soon.",
    "Harper: Thank you for sharing this. It's truly impactful.",
    "Aiden: Funny enough, I was pondering the same thing recently.",
    "Emily: Sending warm wishes your way.",
    "Daniel: It's amazing how quickly time passes.",
    "Grace: That dish looks scrumptious! Mind sharing the recipe?",
    "Benjamin: Your accomplishments never cease to amaze me."
  ];


  constructor(private postService: PostService, private registerationService: RegisterationService, private profileService: ProfileService, private router: Router) {}  // Inject the PostService

  ngOnInit(): void {
    this.setupCurrentUser();
    this.fetchFollowedUsers();
    this.loadArticles();
  }

  setupCurrentUser(): void {
      const currentUser = this.registerationService.getCurrentUser();
      this.username = currentUser.username
      this.getUserHeadline();
  }


  getUserHeadline() {
    const username = this.profileService.getCurrentUser().username; // Make sure the service can provide the current user's username
    if (username) {
      this.profileService.getUserHeadline(username).subscribe(
        response => {
          this.headline = response.headline; // Assuming the response structure is { username: 'user', headline: 'Happy' }
        },
        error => {
          console.error('Error fetching user headline:', error);
          // Handle the error appropriately
        }
      );
    }
  }

  loadArticles() {
    this.postService.getArticles().subscribe({
      next: (response) => {
        this.posts = response; // Assuming the response is an array of articles
        console.log(this.posts);
      },
      error: (error) => {
        console.error('Error fetching articles:', error);
      }
    });
  }

  addComment(comment: string): void {
    // if (!this.post.comments) {
    //   this.post.comments = [];
    // }
    // this.post.comments.push({ content: comment });
  }

  submitComment(postId: number, comment: string): void {
    // console.log(postId, comment);
  }

  // setupUserPosts(userId: number): void {
  //     this.postService.getPostsByIds([userId]).subscribe(posts => {
  //         this.initializePosts(posts);
  //     });
  // }

  // setupFollowedUsersPosts(userId: number): void {
  //     this.registerationService.getFollowedUsers(userId).subscribe(followedUsers => {
  //         if (followedUsers && followedUsers.length > 0) {
  //             this.followedUsers = followedUsers.map(user => ({
  //                 ...user,
  //                 avatar: this.getRandomAvatar()
  //             }));

  //             const followedIds = this.followedUsers.map(user => user.id);
              
  //             this.postService.getPostsByIds(followedIds).subscribe(followedUserPosts => {
  //                 this.initializeFollowedUsersPosts(followedUserPosts);
  //             });
  //         } else {
  //             this.followedUsers = [];
  //         }
  //     });
  // }

  // initializePosts(posts: any[]): void {
  //     let currentDate = new Date('2023-10-12');

  //     if (posts && posts.length > 0) {
  //         this.posts = posts;

  //         this.posts.forEach((post, index) => {
  //             post.image = this.getRandomImage();
  //             post.comments = this.getRandomComment();
  //             post.timestamp = new Date(currentDate);
  //             this.postService.getUserById(post.userId).subscribe(author => {
  //                 post.authorName = author.username;
  //             });
  //             currentDate.setDate(currentDate.getDate() - 1);
  //         });
  //     } else {
  //         this.posts = [];
  //     }

  //     this.searchPost();
  // }

  // initializeFollowedUsersPosts(followedUserPosts: any[]): void {
  //     let currentDate = new Date('2023-10-12');

  //     if (followedUserPosts && followedUserPosts.length > 0) {
  //         this.posts = [...this.posts, ...followedUserPosts];
  //         this.filterPost = [...this.posts];

  //         followedUserPosts.forEach(post => {
  //             post.image = this.getRandomImage();
  //             post.timestamp = new Date(currentDate);
  //             this.postService.getUserById(post.userId).subscribe(author => {
  //                 post.authorName = author.username;
  //             });

  //             currentDate.setDate(currentDate.getDate() - 1);
  //         });
  //     }
  // }


  setLocalStorage(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  getLocalStorage(key: string): any {
    return JSON.parse(localStorage.getItem(key) || 'null');
  }

  removeLocalStorage(key: string): void {
    localStorage.removeItem(key);
  }

  updateHeadline(): void {
    if (this.newHeadline.trim()) {
      this.profileService.updateHeadline(this.newHeadline.trim()).subscribe(
        response => {
          this.headline = response.headline;
        },
        error => {
          console.error('Error updating headline:', error);
        }
      );
      this.newHeadline = '';
    }
  }

  uploadImage(event: Event): void {
    // const input = event?.target as HTMLInputElement;
    // if(input.files && input.files[0]) {
    //   this.selectImage = input.files[0];
    // }
  }

  addFollower(): void {
    this.addFollowerErrorMessage = '';
    const followerUsername = this.newFollowerName.trim();
    
    if (!followerUsername) {
      return;
    }
  
    const currentUser = this.registerationService.getCurrentUser();
    
    if (followerUsername === currentUser.username) {
      this.addFollowerErrorMessage = 'You cannot follow yourself!';
      return;
    }
  
    this.registerationService.addFollower(currentUser.username, followerUsername).subscribe({
      next: (response) => {
        this.followedUsers = response.following;
        this.fetchFollowedUserDetails();
        this.newFollowerName = '';

        // Update articles feed
        this.loadArticles();
      },
      error: (error) => {
        console.error('Error adding follower:', error);
        this.addFollowerErrorMessage = 'Failed to add follower. Please try again.';
      }
    });
  }


  unfollowUser(usernameToUnfollow: string): void {
    if (!usernameToUnfollow) {
      console.error('Username is required to unfollow.');
      return;
    }
  
    this.registerationService.unfollowUser(usernameToUnfollow).subscribe({
      next: () => {
        this.followedUsers = this.followedUsers.filter(username => username !== usernameToUnfollow);
        this.followedUsersDetails = this.followedUsersDetails.filter(user => user.username !== usernameToUnfollow);

        // Update articles feed
        this.loadArticles();
      },
      error: (error) => {
        console.error('Error unfollowing user:', error);
      }
    });
  }

  fetchFollowedUsers(): void {
    const currentUser = this.registerationService.getCurrentUser();
    
    // Fetch the updated list of followed users from the server
    this.registerationService.getFollowedUsers(currentUser.username).subscribe({
      next: (response) => {
        this.followedUsers = response.following;
        this.fetchFollowedUserDetails();
        // this.loadArticles();
      },
      error: (error) => {
        console.error('Error fetching followed users:', error);
      }
    });
  }

  fetchFollowedUserDetails(): void {
    // Ensure there's a current user set before fetching details
    const currentUser = this.profileService.getCurrentUser();
    if (!currentUser || !currentUser.username) {
      console.error('No current user found.');
      return;
    }
  
    // Ensure we have an array of followed users to fetch details for
    if (!this.followedUsers || this.followedUsers.length === 0) {
      console.error('No followed users to fetch details for.');
      return;
    }
  
    // Create an array of Observables for each detail fetch request
    const detailObservables = this.followedUsers.map(username => {
      return this.profileService.getUserHeadline(username).pipe(
        catchError(error => {
          console.error(`Error fetching details for user ${username}:`, error);
          return of({ username, headline: 'Unavailable', avatar: 'default-avatar.png' });
        })
      );
    });
  
    // Use forkJoin to execute all Observables and wait for their completion
    forkJoin(detailObservables).subscribe(responses => {
      this.followedUsersDetails = responses.map(response => {
        return {
          username: response.username,
          headline: response.headline,
          avatar: response.avatar 
        };
      });
    });
  }


  getCatchPhrase(): string {
    const index = Math.floor(Math.random() * this.catchPhrases.length);
    return this.catchPhrases[index];
  }

  getRandomImage(): string {
    return `https://picsum.photos/800/300?random=${Math.random()}`;
  }

  getRandomAvatar(): string {
    return `https://picsum.photos/200/300?random=${Math.random()}`;
  }

  getRandomComment(): string[] {
    let randomComment: string[] = [];
    for (let i = 0; i < 3; i++) {
      const index = Math.floor(Math.random() * this.comments.length);
      randomComment.push(this.comments[index]);
    }
    return randomComment;
  }

  uploadImageBtn(): void {

    this.imageBtnClick = true;
  }

  submitPost(): void {
    if (this.newPostTitle.trim() && this.newPostContent.trim()) {
      // Create the post object to send to the backend
      const newPostData = {
        title: this.newPostTitle,
        text: this.newPostContent,
        image: this.imageBtnClick ? this.getRandomImage() : null,
      };
  
      // Call the service method to create the new post
      this.postService.addArticle(newPostData).subscribe({
        next: (response) => {
          this.posts = response.articles; 
          this.timestamp = response.date;
          this.filterPost = response.articles;
  
          this.newPostTitle = '';
          this.newPostContent = '';
          this.imageBtnClick = false;
        },
        error: (error) => {
          console.error('Error submitting new post:', error);
        }
      });
    }
  }
  


  searchPost(): void { 
    if(this.searchKeyword) {
      const tolowerSearchKeyword = this.searchKeyword.toLocaleLowerCase();
      this.filterPost = this.posts.filter(post => 
        post.authorName && post.authorName.toLocaleLowerCase().includes(tolowerSearchKeyword) || post.body && post.body.toLocaleLowerCase().includes(tolowerSearchKeyword)
      );
    }
    else {
      this.filterPost = [...this.posts];
    }
  }

  clearPost(): void {
    this.newPostTitle = '';
    this.newPostContent = '';
  }

  editPost(postId: number): void {
    console.log('Editing post with ID:', postId);
  }

  commentPost(postId: number): void {
    console.log('Commenting on post with ID:', postId);
  }

  viewProfile(): void {
    this.router.navigate(['/profile']);
  }

  logout(): void {
    this.registerationService.logoutUser().subscribe(
      () => { 
        this.registerationService.clearCurrentUser();
        localStorage.removeItem('headline');
        this.router.navigate(['/auth']);
      },
      error => {
        console.error('Error during logout:', error);
      }
    );
  }
}