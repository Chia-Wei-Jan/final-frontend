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

  allPosts: any[] = [];
  posts: any[] = []; // Store the posts
  currentPage: number = 1;
  totalPosts :number = 0;
  pageSize: number = 10;
  
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

  selectImage: File | null = null;
  newUser: boolean = false;
  allUsers: any[] = [];
  addFollowerErrorMessage: String = '';

  editTexts: { [key: string]: string } = {};
  newTitle: string = '';
  newText: string = '';
  showComment: boolean = false; 
  newComment: string = ''; 

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
      this.loadUserAvatar();
  }


  getUserHeadline() {
    const username = this.profileService.getCurrentUser().username; 
    if (username) {
      this.profileService.getUserHeadline(username).subscribe(
        response => {
          this.headline = response.headline; 
        },
        error => {
          console.error('Error fetching user headline:', error);
          // Handle the error appropriately
        }
      );
    }
  }

  loadUserAvatar() {
    this.profileService.getAvatar(this.username).subscribe(
      response => {
        this.avatarUrl = response.avatar;
      },
      error => {
        console.error('Error fetching avatar:', error);
      }
    );
  }

  loadArticles() {
    this.postService.getArticles().subscribe({
      next: (response) => {
        this.allPosts = response; 
        this.totalPosts = response.length;
        this.updatePage(this.currentPage); // Initialize the view with the first page
      },
      error: (error) => {
        console.error('Error fetching articles:', error);
      }
    });
  }

  updatePage(page: number) {
    const startIndex = (page - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.totalPosts);
    this.posts = this.allPosts.slice(startIndex, endIndex);
    this.filterPost = this.allPosts.slice(startIndex, endIndex);
    this.currentPage = page;
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.updatePage(page);
  }

  get totalPages(): number {
    return Math.ceil(this.allPosts.length / this.pageSize);
  }


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
    const currentUser = this.profileService.getCurrentUser();
    if (!currentUser || !currentUser.username) {
      console.error('No current user found.');
      return;
    }
  
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


  getRandomImage(): string {
    return `https://picsum.photos/800/300?random=${Math.random()}`;
  }

  getRandomAvatar(): string {
    return `https://picsum.photos/200/300?random=${Math.random()}`;
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
          this.loadArticles();
  
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
        post.author && post.author.toLocaleLowerCase().includes(tolowerSearchKeyword) || post.title && post.title.toLocaleLowerCase().includes(tolowerSearchKeyword) || post.body && post.body.toLocaleLowerCase().includes(tolowerSearchKeyword)
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

  enableEditing(post: any): void {
    post.editing = true;
    post.editedText = post.text; // Copy the current text to a new property
  }
  
  saveChanges(post: any): void {
    const updatedData = { text: post.editedText };

    this.postService.updateArticle(post._id, updatedData).subscribe({
      next: (response) => {
        post.text = post.editedText;
        post.editing = false; 
      },
      error: (error) => {
        console.error('Error saving post:', error);
      }
    });
  }
  
  cancelEditing(post: any): void {
    post.editing = false;
    post.editedText = post.text;
  }

  editPost(post: any): void {
    if (!post.editedText) {
      return;
    }

    const updatedData = {
      text: post.editedText,
      // Add other fields if necessary, e.g., commentId
    };

    // Call the service method to update the article
    this.postService.updateArticle(post.id, updatedData).subscribe({
      next: (response) => {
        post.text = post.editedText;
        post.editing = false;
      },
      error: (error) => {
        console.error('Error updating post:', error);
      }
    });
  }

  submitComment(postId: string, commentText: string): void {
    if (!commentText) {
      console.error('Comment text is required.');
      return;
    }
  
    const commentData = { text: commentText, commentId: '-1' };
    this.postService.addComment(postId, commentData).subscribe({
      next: (response) => {
        this.loadArticles();
      },
      error: (error) => {
        console.error('Error submitting comment:', error);
      }
    });
  }

  enableCommentEditing(comment: any) {
    comment.isEditing = true;
    comment.editedText = comment.text; 
  }

  // Submit the edited comment
  submitCommentEdit(postId: string, comment: any) {
    if (!comment.editedText.trim()) {
      console.error('Comment text is required.');
      return;
    }

    const updatedCommentData = {
      text: comment.editedText,
      commentId: comment._id 
    };

    this.postService.updateComment(postId, updatedCommentData).subscribe({
      next: (response) => {
        comment.text = comment.editedText; 
        comment.isEditing = false; 
      },
      error: (error) => {
        console.error('Error updating comment:', error);
      }
    });
  }

  cancelCommentEditing(comment: any) {
    comment.isEditing = false;
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