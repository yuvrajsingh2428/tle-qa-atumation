export const COURSE_DATA = {
    level1: {
        name: 'Level 1 Course',
        price: 1249,
        discountedPrice: 874, // 30% off
        validity: {
            content: '12 Months',
            doubtSupport: '3 Months'
        }
    },
    level2: {
        name: 'Level 2 Course',
        price: 2499,
        discountedPrice: 1749,
        validity: {
            content: '12 Months',
            doubtSupport: '3 Months'
        }
    },
    level3: {
        name: 'Level 3 Course',
        price: 4374,
        discountedPrice: 3061,
        validity: {
            content: '12 Months',
            doubtSupport: '3 Months'
        }
    },
    level4: {
        name: 'Level 4 Course',
        price: 5624,
        discountedPrice: 3936,
        validity: {
            content: '12 Months',
            doubtSupport: '3 Months'
        }
    },
    bundle_l1_l2: {
        validity: {
            content: '12 Months',
            doubtSupport: '6 months'
        }
    },
    coupons: {
        default: 'ALUMNI30', // Assuming this based on "30% Alumni Discount"
        invalid: 'INVALIDCODE123'
    }
};
