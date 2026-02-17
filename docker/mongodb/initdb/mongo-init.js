db.createCollection("tags");
db.createCollection("blogs");

const tags = {
  AWS: ["CDK", "CloudFront", "S3", "VPC"],
};

const blogs = [
  {
    title: "S3 Presigned URL VS CloudFront Signed URL",
    description:
      "resource ใน private subnet ที่เชื่อมต่อ internet ไม่ได้ สามารถเข้าถึง DNS resolve ได้ยังไง บทความนี้มีคำตอบครับ",
    category: "AWS",
    subcategories: ["S3", "CloudFront"],
    publishDate: "2025-04-15",
    thumbnail:
      "http://localhost:43210/src/assets/blog/s3-pre-signed-url-vs-cloudfront-signed-url/thumbnail.png",
    slug: "s3-pre-signed-url-vs-cloudfront-signed-url",
  },
  {
    title: "เรารันคำสั่ง cdk bootstrap ไปทำไม",
    description:
      "เรารันคำสั่ง cdk bootstrap ไปทำไม รันแล้วเกิดอะไรขึ้น บทความนี้มีคำตอบครับ",
    category: "AWS",
    subcategories: ["CDK"],
    publishDate: "2025-03-31",
    thumbnail:
      "http://localhost:43210/src/assets/blog/what-happens-when-we-bootstrap-cdk/thumbnail.png",
    slug: "what-happens-when-we-bootstrap-cdk",
  },
  {
    title: "resource ที่อยู่ใน private subnet สามารถ resolve DNS หากันได้ยังไง",
    description:
      "resource ใน private subnet ที่เชื่อมต่อ internet ไม่ได้ สามารถเข้าถึง DNS resolve ได้ยังไง บทความนี้มีคำตอบครับ",
    category: "AWS",
    subcategories: ["VPC"],
    publishDate: "2025-03-13",
    thumbnail:
      "http://localhost:43210/src/assets/blog/how-private-resources-resolve-dns/thumbnail.png",
    slug: "how-private-resources-resolve-dns",
  },
];

for (const [category, subcategories] of Object.entries(tags)) {
  db.tags.insertMany([
    {
      category: null,
      value: category,
    },
    ...subcategories.map((subcategory) => ({
      category,
      value: subcategory,
    })),
  ]);
}

db.blogs.insertMany(blogs);
