let eventBus = new Vue()

Vue.component('product-tabs', {
    props: {
        reviews: { type: Array, required: false },
        shippingCost: { required: true },
        details: { type: Array, required: true }
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

Vue.component('product-review', {
    template: `
    <form class="review-form" @submit.prevent="onSubmit">
     <p v-if="errors.length">
       <b>Please correct the following error(s):</b>
       <ul><li v-for="error in errors">{{ error }}</li></ul>
     </p>
     <p>
       <label for="name">Name:</label>
       <input id="name" v-model="name" placeholder="name">
     </p>
     <p>
       <label for="review">Review:</label>
       <textarea id="review" v-model="review"></textarea>
     </p>
     <p>
       <label for="rating">Rating:</label>
       <select id="rating" v-model.number="rating">
         <option>5</option><option>4</option><option>3</option><option>2</option><option>1</option>
       </select>
     </p>
     <p><input type="submit" value="Submit"></p>
    </form>
 `,
    data() {
        return { name: '', review: '', rating: null, recommendation: '', errors: [] }
    },
    methods: {
        onSubmit() {
            if (this.name && this.review && this.rating) {
                const productReview = { name: this.name, review: this.review, rating: this.rating };
                eventBus.$emit('review-submitted', productReview);
                this.name = ''; this.review = ''; this.rating = null;
            } else {
                if (!this.name) this.errors.push("Name required.")
                if (!this.review) this.errors.push("Review required.")
                if (!this.rating) this.errors.push("Rating required.")
            }
        }
    }
})

Vue.component('product', {
    props: {
        premium: { type: Boolean, required: true }
    },
    template: `
    <div class="product">
        <div class="product-image">
            <img v-bind:src="image" v-bind:alt="altText" />
        </div>
        <div class="product-info">
            <h1>{{ title }}</h1>
            
            <h2>Price: {{ price }} $</h2>
            <p v-if="!selectedSize">Select a size to check stock</p>
            <p v-else-if="currentSizeQty > 10">Plenty in stock</p>
            <p v-else-if="currentSizeQty > 0">Almost sold out! ({{ currentSizeQty }} left)</p>
            <p v-else class="nostock" style="color:red">Out of stock</p>
            
            <div class="color-box"
                    v-for="(variant, index) in variants"
                    :key="variant.variantId"
                    :style="{ backgroundColor: variant.variantColor }"
                    @mouseover="updateProduct(index)"
            ></div>

            <h3>Sizes:</h3>
            <ul class="size-list">
                <li v-for="(sizeObj, index) in variants[selectedVariant].sizes"
                    :key="index"
                    class="size-item"
                    :class="{ 
                        'disabled-size': sizeObj.qty === 0,
                        'active-size': selectedSize === sizeObj.name && sizeObj.qty > 0
                    }"
                    @click="selectSize(sizeObj)"
                >
                    {{ sizeObj.name }}
                </li>
            </ul>

            <button v-on:click="addToCart"
                   :disabled="!canAddToCart"
                   :class="{ disabledButton: !canAddToCart }"
            >
               {{ buttonText }}
            </button>
            
            <button v-on:click="removeFromCart">delete last</button>
        </div>
        <product-tabs :reviews="reviews" :shipping-cost="shipping" :details="details"></product-tabs>
    </div> `,
    data() { return {
        product: "Socks",
        brand: 'Vue Mastery',
        selectedVariant: 0,
        selectedSize: '',
        altText: "A pair of socks",
        details: ['90% cotton', '10% polyester', 'Gender-neutral'],
        variants: [
            {
                variantId: 2234,
                variantColor: 'green',
                variantImage: "./assets/vmSocks-green-onWhite.jpg",
                variantPrice: 100,
                sizes: [
                    { name: '36-38', qty: 3 }, 
                    { name: '40-42', qty: 2 },
                    { name: '44-46', qty: 0 }
                ]
            },
            {
                variantId: 2235,
                variantColor: 'blue',
                variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                variantPrice: 120,
                sizes: [
                    { name: '32-34', qty: 5 },
                    { name: '36-38', qty: 0 },
                    { name: '40-42', qty: 1 } 
                ]
            }
        ],
        reviews: [],
    }},
    methods: {
        addToCart() {
            const variant = this.variants[this.selectedVariant];
            const sizeObj = variant.sizes.find(s => s.name === this.selectedSize);

            if (sizeObj && sizeObj.qty > 0) {
                sizeObj.qty--;

                this.$emit('add-to-cart', {
                    id: variant.variantId,
                    price: variant.variantPrice
                });
            }
        },
        removeFromCart() {
            this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId);
        },
        updateProduct(index) {
            this.selectedVariant = index;
            this.selectedSize = '';
        },
        selectSize(sizeObj) {
            if (sizeObj.qty > 0) {
                this.selectedSize = sizeObj.name;
            }
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
        price() {
            return this.variants[this.selectedVariant].variantPrice;
        },
        shipping() {
            if (this.premium) return "Free";
            return 2.99;
        },
        currentSizeQty() {
            if (!this.selectedSize) return 0;
            const size = this.variants[this.selectedVariant].sizes.find(s => s.name === this.selectedSize);
            return size ? size.qty : 0;
        },
        canAddToCart() {
            return this.selectedSize !== '' && this.currentSizeQty > 0;
        },
        // Текст кнопки
        buttonText() {
            if (this.selectedSize === '') return 'Select Size';
            if (this.currentSizeQty === 0) return 'Out of Stock';
            return 'Add to cart';
        }
    },
})

let app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: [],
    },
    computed: {
        cartTotal() {
            return this.cart.reduce((sum, item) => sum + item.price, 0);
        }
    },
    methods: {
        updateCart(product) {
            this.cart.push(product);
        },
        updateRemove(id) {
            const index = this.cart.findIndex(item => item.id === id);
            if (index !== -1) {
                this.cart.splice(index, 1);
            }
        }
    }
})