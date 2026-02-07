let eventBus = new Vue()
Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: false,
        },
        shippingCost: {
            type: String,
            required: true
        },
        details: {
            type: Array,
            required: true
        }
    },
    template: `
            <div>   
                <ul>
                    <span class="tab"
                          :class="{ activeTab: selectedTab === tab }"
                          v-for="(tab, index) in tabs"
                          @click="selectedTab = tab"
                    >{{ tab }}</span>
                </ul>
                <div v-show="selectedTab === 'Reviews'">
                    <p v-if="!reviews.length">There are no reviews yet.</p>
                    <ul>
                        <li v-for="review in reviews" :key="review.name">
                            <p>{{ review.name }}</p>
                            <p>Rating: {{ review.rating }}</p>
                            <p>{{ review.review }}</p>
                            <p>{{ review.recommendation }}</p>
                        </li>
                    </ul>
                </div>
                <div v-show="selectedTab === 'Make a Review'">
                    <product-review></product-review>
                </div>
                <div v-show="selectedTab === 'Shipping'">
                    <p>Shipping is {{ shippingCost }}</p>
                </div>
                <div v-show="selectedTab === 'Details'">
                    <h2>Details:</h2>
                    <ul>
                        <li v-for="detail in details" :key="detail">{{ detail }}</li>
                    </ul>
                </div>
            </div>
 `,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review', 'Shipping', 'Details'],
            selectedTab: 'Reviews'
        }
    }
})

Vue.component('product-details', {
    props: {
        details: {
            type: Array,
        }
    },
    template: `
    <ul class="product-details-list">
      <li v-for="(detail, index) in details" :key="index">
        {{ detail }}
      </li>
    </ul>
  `
});
Vue.component('product-review', {
    template: `
    <form class="review-form" @submit.prevent="onSubmit">

    <p v-if="errors.length">
     <b>Please correct the following error(s):</b>
     <ul>
       <li v-for="error in errors">{{ error }}</li>
     </ul>
    </p>
    
     <p>
       <label for="name">Name:</label>
       <input id="name" v-model="name" placeholder="name">
     </p>
    <p>
        Would you recommend this product?
        <div>
            <label for="yes">Yes</label>
            <input type="radio" id="yes" name="yes_or_no" value="yes" v-model="recommendation">
        </div>
        <div>
            <label for="no">No</label>
            <input type="radio" id="no" name="yes_or_no" value="no" v-model="recommendation">
        </div>
    </p>
     <p>
       <label for="review">Review:</label>
       <textarea id="review" v-model="review"></textarea>
     </p>
    
     <p>
       <label for="rating">Rating:</label>
       <select id="rating" v-model.number="rating">
         <option>5</option>
         <option>4</option>
         <option>3</option>
         <option>2</option>
         <option>1</option>
       </select>
     </p>
    
     <p>
       <input type="submit" value="Submit"> 
     </p>
    
    </form>

 `,
    data() {
        return {
            name: '',
            review: '',
            rating: null,
            recommendation: '',
            errors: []
        }
    },
    methods: {
        onSubmit() {
            this.errors = [];
            if (this.name && this.review && this.rating && this.recommendation) {
                const productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommendation: this.recommendation
                };
                eventBus.$emit('review-submitted', productReview);
                this.resetForm();
            } else {
                this.errors.push(...[
                    !this.name && "Name required.",
                    !this.review && "Review required.",
                    !this.rating && "Rating required.",
                    !this.recommendation && "Recommendation required."
                ].filter(Boolean));
            }
        },
        resetForm() {
            this.name = '';
            this.review = '';
            this.rating = null;
            this.recommendation = '';
        }
}})

Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true,
        }
    },
    template: `
    <div class="product">
        <div class="product-image">
            <img v-bind:src="image" v-bind:alt="altText" />
        </div>
        <div class="product-info">
            <h1>{{ title }}</h1>
            <span>{{sale}}</span>
            <span v-else></span>
            <p>{{ description }}</p>
            <p v-if="variants[selectedVariant].variantQuantity > 10">
                Plenty in stock
            </p>
            <p v-else-if="variants[selectedVariant].variantQuantity > 0">
                Almost sold out!
            </p>
            <p v-else class="nostock">
                Out of stock
            </p>
            <div
                    class="color-box"
                    v-for="(variant, index) in variants"
                    :key="variant.variantId"
                    :style="{ backgroundColor:variant.variantColor }"
                    @mouseover="updateProduct(index)"
            ></div>
            <ul>
                <li v-for="size in sizes">{{ size }}</li>
            </ul>
            <a v-bind:href="link">More products like this</a><br>
           <button
                   v-on:click="addToCart"
                   :disabled="!inStock"
                   :class="{ disabledButton: !inStock }"
           >
               Add to cart
           </button>
            <button v-on:click="removeFromCart">delete</button>
        </div>
        <product-tabs :reviews="reviews" :shipping-cost="shipping" :details="details"></product-tabs>
    </div> `,
    data() { return {
        product: "Socks",
        brand: 'Vue Mastery',
        description: "A pair of warm, fuzzy socks",
        selectedVariant: 0,
        altText: "A pair of socks",
        link: "https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=socks",
        inStock: true,
        inventory: 10,
        onSale: true,
        details: ['80% cotton', '20% polyester', 'Gender-neutral'],
        variants: [
            {
                variantId: 2234,
                variantColor: 'green',
                variantImage: "./assets/vmSocks-green-onWhite.jpg",
                variantQuantity: 10
            },
            {
                variantId: 2235,
                variantColor: 'blue',
                variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                variantQuantity: 0
            }
        ],

        sizes: ['32-34', '36-38', '40-42', '44-46', '48-50', '52-54'],
        cart: [],
        reviews: [],

    }},
    methods: {
        addToCart() {
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId);
        },
        removeFromCart() {
            this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId);
        },
        updateProduct(index) {
            this.selectedVariant = index;
            console.log(index);
        }
    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview)
        })
    },
    computed: {
        title() {
            return this.brand + ' ' + this.product;
        },
        image() {
            return this.variants[this.selectedVariant].variantImage;
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantity > 0;
        },
        sale(){
            if (this.onSale === true)
                return this.brand + ' sells ' + this.product + ' with 50% discount!';
        },
        shipping() {
            if (this.premium) {
                return "Free";
            } else {
                return 2.99
            }
        },
    },
})
let app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: [],
    },
    methods: {
        updateCart(id) {
            this.cart.push(id);
        },
        updateRemove(id) {
            this.cart.pop(id);
        },
        addReview(productReview) {
            this.reviews.push(productReview)
        },
    }
})