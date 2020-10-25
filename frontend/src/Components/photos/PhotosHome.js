import React from 'react'
import { CarouselProvider, Slider, Slide, ButtonBack, ButtonNext } from 'pure-react-carousel'
import 'pure-react-carousel/dist/react-carousel.es.css'

import ProfileCard from './photosSubComponents/ProfileCard'
import PhotosGalleryContainer from './photosSubComponents/PhotosGalleryContainer'

import { createPhoto, getProfileIndex, getUserProfile } from '../../lib/api'
import { Icon } from 'semantic-ui-react'
// import { setAvatar } from '../../lib/assets'

class PhotosHome extends React.Component {

  state = {
    createdPhotos: [],
    profilesSuggestedToFollow: [],
    photosByFollowees: []
  }

  updateOwner = (followee) => {
    return followee.created_photo.map(photo => {
      return { ...photo, owner: followee.username }
    })
  }

  async componentDidMount() {

    const response = await getProfileIndex()
    console.log('RESPONSE ON HOMEPAGE', response)
    // get user's personal profile
    const userProfile = await getUserProfile()
    console.log('PROFILE', userProfile.data)

    // get photos by people that the user follows
    //(owner information needs to be added into the individual photos)
    const following = userProfile.data.following
    const photosByFollowees = following
      .map(followee => {
        return this.updateOwner(followee)
      })
      .flat()

    //We will make some suggestions for photographers for the user to follow\
    //Splice for profiles that the user does not already follow
    const allProfilesNotFollowing = [...response.data]
    following.forEach(followee => {
      const removeIndex = allProfilesNotFollowing.map(item => item.id).indexOf(followee.id)
      console.log(removeIndex)
      removeIndex && allProfilesNotFollowing.splice(removeIndex, 1)
    })

    console.log(allProfilesNotFollowing)

    //Filter for profiles having 3 or more photos
    const profilesWithPhotos = allProfilesNotFollowing.filter(profile => {
      return profile.created_photo.length >= 3
    })
    const profilesSuggestedToFollow = []

    //limit profile-to-follow suggestions to 10 max. 
    if (profilesWithPhotos.length >= 10) {
      for (let i = 0; i < 10; i++) {
        profilesSuggestedToFollow.push(profilesWithPhotos[i])
      }
    } else {
      profilesWithPhotos.forEach(profile => profilesSuggestedToFollow.push(profile))
    }

    this.setState({
      createdPhotos: userProfile.data.created_photo,
      profilesSuggestedToFollow,
      photosByFollowees
    })

  }

  render() {
    const { createdPhotos, profilesSuggestedToFollow, photosByFollowees } = this.state

    return (
      <>
        <h1 className='homefeed-title'>Home Feed</h1>
        <p className='homefeed-intro'>See photos and published Galleries from people you follow.</p>
        <div className='members-ad-container'>
          <div className='members-ad'>
            <div className='members-ad-text'>
              <h1 className='members-ad-title'>Members get more.</h1>
              <p>Membership is not available on this clone, but if it were, it would start at $2.99/month</p>
            </div>
          </div>
        </div>
        <div className='profiles-to-follow'>
          <CarouselProvider
            naturalSlideWidth={100}
            naturalSlideHeight={60}
            totalSlides={profilesSuggestedToFollow.length}
            visibleSlides={3.5}
          >
            <div className='container'>
              <Slider>
                {
                  profilesSuggestedToFollow.map((profile, index) => {
                    return (
                      <Slide key={index} index={index} className='slide'>
                        <ProfileCard
                          key={profile.id}
                          created_photo={profile.created_photo}
                          username={profile.username}
                          profileImage={profile.profile_image}
                          {...profile}
                        />
                      </Slide>
                    )
                  })
                }

              </Slider>
              <div className='slider-btn-container'>
                <ButtonBack className='buttonBack'><Icon name='chevron circle left' size='big'/></ButtonBack>
                <ButtonNext className='buttonNext'><Icon name='chevron circle right' size='big'/></ButtonNext>
              </div>
            </div>
          </CarouselProvider>
        </div>


        <PhotosGalleryContainer
          followeePhotos={photosByFollowees}
          ownerPhotos={createdPhotos}
        />

      </>
    )
  }
}

export default PhotosHome