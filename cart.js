const { defineRule, Form, Field, ErrorMessage, configure } = VeeValidate;
const { required, email, min, max } = VeeValidateRules;
const { localize, loadLocaleFromURL } = VeeValidateI18n;

defineRule('required', required);
defineRule('email', email);
defineRule('min', min);
defineRule('max', max);

loadLocaleFromURL(
  'https://unpkg.com/@vee-validate/i18n@4.1.0/dist/locale/zh_TW.json'
);

configure({
  // 用來做一些設定
  generateMessage: localize('zh_TW'),
  // 啟用 locale
});
const apiUrl = 'https://vue3-course-api.hexschool.io/v2';
const apiPath = 'paperplane-hexschool';
const app = Vue.createApp({
  data() {
    return {
      cartData: {
        carts: [],
      },
      products: [],
      select_product: '',
      isLoadingItem: '',
      allDeleting: false,
      form: {
        user: {
          name: '',
          email: '',
          tel: '',
          address: '',
        },
        message: '',
      },
    };
  },
  components: {
    VForm: Form,
    VField: Field,
    ErrorMessage: ErrorMessage,
  },
  methods: {
    getProducts() {
      axios.get(`${apiUrl}/api/${apiPath}/products/all`).then((res) => {
        this.products = res.data.products;
      });
    },
    openProductModal(id) {
      this.select_product = id;
      // this.$refs.productModal.openModal();
    },
    getCart() {
      axios.get(`${apiUrl}/api/${apiPath}/cart`).then((res) => {
        this.cartData = res.data.data;
      });
    },
    addToCart(id, qty = 1) {
      const data = {
        product_id: id,
        qty,
      };
      this.isLoadingItem = id;
      axios.post(`${apiUrl}/api/${apiPath}/cart`, { data }).then(() => {
        this.getCart();
        this.$refs.productModal.closeModal();
        this.isLoadingItem = '';
      });
    },
    removeCartItem(id) {
      this.isLoadingItem = id;
      axios.delete(`${apiUrl}/api/${apiPath}/cart/${id}`).then((res) => {
        this.getCart();
        this.isLoadingItem = '';
        alert(res.data.message);
      });
    },
    removeAllCartItem() {
      this.allDeleting = true;
      axios.delete(`${apiUrl}/api/${apiPath}/carts`).then((res) => {
        this.getCart();
        this.allDeleting = false;
        alert(res.data.message);
      });
    },
    updateCartItem(item) {
      if (item.qty <= 0) {
        alert('商品數量請勿小於 0');
        this.getCart();
        return;
      }
      const data = {
        product_id: item.id,
        qty: item.qty,
      };
      this.isLoadingItem = item.id;
      axios
        .put(`${apiUrl}/api/${apiPath}/cart/${item.id}`, { data })
        .then((res) => {
          this.getCart();
          this.isLoadingItem = '';
        });
    },
    sendOrder() {
      axios
        .post(`${apiUrl}/api/${apiPath}/order`, { data: this.form })
        .then(() => {
          this.$refs.form.resetForm();
          this.getCart();
          alert('訂單建立成功');
          this.form.message = '';
        });
    },
  },
  mounted() {
    this.getProducts();
    // console.log('mounted');
    this.getCart();
  },
});

// 查看更多彈窗
app.component('product-modal', {
  props: ['id'],
  template: '#userProductModal',
  data() {
    return {
      modal: {},
      product: {},
      product_count: 1,
    };
  },
  watch: {
    id() {
      this.getProduct();
    },
    product_count(val) {
      if (val <= 0) {
        // console.log(val);
        alert('商品數量請勿小於 0');
        this.product_count = 1;
      }
    },
  },
  methods: {
    openModal() {
      this.modal.show();
    },
    closeModal() {
      this.modal.hide();
    },
    getProduct() {
      axios.get(`${apiUrl}/api/${apiPath}/product/${this.id}`).then((res) => {
        this.product = res.data.product;
        this.modal.show();
      });
    },
    addToCart() {
      this.$emit('add-cart', this.product.id, this.product_count);
    },
  },
  mounted() {
    this.modal = new bootstrap.Modal(this.$refs.modal);
  },
});

app.mount('#app');
