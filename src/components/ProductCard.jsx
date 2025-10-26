import React from "react";
import { motion } from "framer-motion";
import { Star, Heart, ShoppingBag } from "lucide-react";

export default function ProductCard({
  product,
  index,
  viewMode,
  handleWishlistToggle,
  isInWishlist,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group cursor-pointer ${
        viewMode === "list" ? "flex" : ""
      }`}
    >
      <div
        className={`relative ${
          viewMode === "list" ? "w-48 flex-shrink-0" : ""
        }`}
      >
        <div
          className={`${
            viewMode === "list" ? "h-48" : "aspect-square"
          } bg-gray-100 flex items-center justify-center`}
        >
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
          )}
        </div>
        {product.badge && (
          <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
            {product.badge}
          </span>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleWishlistToggle(product);
          }}
          className={`absolute top-2 right-2 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity ${
            isInWishlist(product.id)
              ? "bg-red-500 text-white"
              : "bg-white text-gray-600 hover:bg-red-50"
          }`}
        >
          <Heart
            className={`h-4 w-4 ${
              isInWishlist(product.id) ? "fill-current" : ""
            }`}
          />
        </button>
      </div>

      <div className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>

        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating || 0)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          {typeof product.reviews === "number" && (
            <span className="text-sm text-gray-500 ml-2">
              ({product.reviews})
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-black">
              {Number(product.price || 0).toLocaleString()}đ
            </span>
            {product.originalPrice ? (
              <span className="text-sm text-gray-400 line-through">
                {Number(product.originalPrice).toLocaleString()}đ
              </span>
            ) : null}
          </div>
          <button className="p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
            <ShoppingBag className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
